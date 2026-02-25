import prisma from '@exness-v3/db';
import { prices, users } from '../../memoryDb.js';
import { calculatePnl, closeOrder } from '../utils/liquidation.utils.js';
import { sendAcknowledgement } from '../utils/send-ack';
import { processPriceTickForCandles, getCandlesticks, candleStore } from '../utils/candlestick.utils.js';

import type { PriceStore, Trade } from '../types';
import type {
  CloseOrderPayload,
  FetchOpenOrdersPayload,
  OpenTradePayload,
  FetchCandlesticksPayload,
} from '../types/handler.type.js';

export async function handlePriceUpdateEntry(payload: PriceStore) {

  // update in memory price
  Object.assign(prices, payload);

  // Update candlesticks for all symbols in the price update
  const currentTime = Date.now();
  Object.entries(payload).forEach(([symbol, priceData]) => {
    // Use mid price for candlesticks (average of buy and sell)
    const midPrice = (priceData.buyPrice + priceData.sellPrice) / (2 * Math.pow(10, priceData.decimal));
    processPriceTickForCandles(symbol, midPrice, currentTime);
  });

  for (const user of Object.values(users)) {
    for (const order of [...user.trades]) {
      const currentPrices = prices[order.asset];
      if (!currentPrices?.buyPrice || !currentPrices?.sellPrice) {
        continue;
      }

      const { id, side, stopLoss, takeProfit, margin } = order;
      let pnlToRealize: number | null = null;
      let closeReason: string | null = null;

      const relevantPrice =
        side === 'LONG'
          ? currentPrices.buyPrice / 10 ** currentPrices.decimal
          : currentPrices.sellPrice / 10 ** currentPrices.decimal;
      if (side === 'LONG') {
        if (stopLoss && relevantPrice <= stopLoss) {
          pnlToRealize = calculatePnl(order, stopLoss);
          closeReason = 'Stop Loss';
        } else if (takeProfit && relevantPrice >= takeProfit) {
          pnlToRealize = calculatePnl(order, takeProfit);
          closeReason = 'Take Profit';
        }
      } else {
        // SHORT
        if (stopLoss && relevantPrice >= stopLoss) {
          pnlToRealize = calculatePnl(order, stopLoss);
          closeReason = 'Stop Loss';
        } else if (takeProfit && relevantPrice <= takeProfit) {
          pnlToRealize = calculatePnl(order, takeProfit);
          closeReason = 'Take Profit';
        }
      }

      if (!closeReason) {
        const unrealizedPnl = calculatePnl(order, relevantPrice);
        if (margin && unrealizedPnl < 0 && Math.abs(unrealizedPnl) >= margin) {
          pnlToRealize = unrealizedPnl;
          closeReason = 'Liquidation';
        }
      }

      if (closeReason && pnlToRealize !== null) {
        await closeOrder(user, id, pnlToRealize, closeReason, currentPrices);
      }
    }
  }
}

export async function handleOpenTrade(
  payload: OpenTradePayload,
  requestId: string
) {
  try {
    const { email, trade } = payload;

    const user = users[email];

    if (!user) {
      console.log(`Attempted to open trade for non-existent user: ${email}`);
      await sendAcknowledgement(requestId, 'TRADE_OPEN_FAILED', {
        reason: 'User not found',
      });
      return;
    }
    const {
      asset,
      leverage,
      side,
      quantity,
      id,
      stopLoss,
      takeProfit,
      slippage,
      tradeOpeningPrice,
    } = trade;

    const currentPrice = prices[asset];
    if (!currentPrice) {
      console.log(`Price not available for asset: ${asset}`);
      await sendAcknowledgement(requestId, 'TRADE_OPEN_FAILED', {
        reason: `Price for asset ${asset} is not available.`,
      });
      return;
    }

    const openPrice =
      side === 'LONG'
        ? currentPrice.buyPrice / 10 ** currentPrice.decimal
        : currentPrice.sellPrice / 10 ** currentPrice.decimal;

    const slippedFraction = Math.abs(
      (tradeOpeningPrice - openPrice) / openPrice
    );
    const maxSlippageFraction = slippage / 100;

    if (maxSlippageFraction > 0 && slippedFraction > maxSlippageFraction) {
      console.warn(
        `Slippage exceeded for ${asset}: requested=${tradeOpeningPrice}, open=${openPrice}, allowed=${slippage}%`
      );
      // For now we still proceed with opening the trade using current engine price.
    }
    if (!leverage || leverage <= 0) {
      await sendAcknowledgement(requestId, 'TRADE_OPEN_FAILED', {
        reason: 'Invalid leverage',
      });
      return;
    }
    const marginRequired = (quantity * openPrice) / leverage;

    if (user.balance.amount < marginRequired) {
      await sendAcknowledgement(requestId, 'TRADE_OPEN_FAILED', {
        reason: 'Insufficient balance',
        marginRequired: marginRequired,
        availableBalance: user.balance.amount,
      });
      return;
    }

    user.balance.amount -= marginRequired;
    console.log(user.balance);
    const newTrade: Trade = {
      id,
      asset,
      leverage,
      side,
      quantity,
      margin: marginRequired,
      status: 'OPEN',
      openPrice,
      stopLoss,
      takeProfit,
      createdAt: new Date(),
      tradeOpeningPrice: tradeOpeningPrice,
      slippage: slippage / 100,
    };

    user.trades.push(newTrade);

    await sendAcknowledgement(requestId, 'TRADE_OPEN_ACKNOWLEDGEMENT', {
      status: 'success',
      tradeDetails: newTrade,
    });
  } catch (err) {
    console.error('Error in handleOpenTrade:', err);
    await sendAcknowledgement(requestId, 'TRADE_OPEN_ERROR', { message: err });
  }
}

// Handles close trade in engine
export async function handleCloseTrade(
  payload: CloseOrderPayload,
  requestId: string
) {
  try {
    const { email, orderId } = payload;
    const user = users[email];

    if (!user) {
      console.log(`Attempted to close trade for non-existent user: ${email}`);

      await sendAcknowledgement(requestId, 'TRADE_CLOSE_FAILED', {
        reason: 'User not found',
      });
      return;
    }
    const tradeToClose = user.trades.find(
      (trade: any) => trade.id === orderId && trade.status === 'OPEN'
    );

    if (!tradeToClose) {
      await sendAcknowledgement(requestId, 'TRADE_CLOSE_FAILED', {
        reason: 'Open trade not found',
      });
      return;
    }

    const { asset, side, openPrice, quantity, margin, leverage, slippage } =
      tradeToClose;

    const currentPrice = prices[asset];
    if (!currentPrice) {
      await sendAcknowledgement(requestId, 'TRADE_CLOSE_FAILED', {
        reason: `Cannot close trade, price for asset ${asset} is not available.`,
      });
      return;
    }

    const closePrice =
      side === 'LONG'
        ? currentPrice.sellPrice / 10 ** currentPrice.decimal
        : currentPrice.buyPrice / 10 ** currentPrice.decimal;

    const pnl = calculatePnl(tradeToClose, closePrice);

    user.balance.amount += margin + pnl;
    tradeToClose.status = 'CLOSED';
    tradeToClose.closePrice = closePrice;
    tradeToClose.pnl = pnl;
    tradeToClose.closedAt = new Date();

    console.log(`Successfully closed trade ${orderId}. PnL: ${pnl}`);

    await prisma.existingTrade.create({
      data: {
        userId: user.id,
        asset: asset,
        openPrice: openPrice,
        closePrice: closePrice,
        leverage: leverage,
        pnl: tradeToClose.pnl,
        liquidated: false,
        createdAt: new Date(),
        slippage: slippage,
        side: side,
        reason: 'Closed by user',
        quantity: quantity,
      },
    });

    await prisma.user.update({
      where: {
        email: user.email,
      },
      data: {
        balance: user.balance.amount,
      },
    });

    user.trades = user.trades.filter((trade: any) => trade.id !== orderId);

    await sendAcknowledgement(requestId, 'TRADE_CLOSE_ACKNOWLEDGEMENT', {
      status: 'success',
    });
  } catch (err) {
    console.error('Error in closing trade:', err);
    await sendAcknowledgement(requestId, 'TRADE_CLOSE_ERROR', {
      message: err,
    });
  }
}

export async function handleFetchOpenOrders(
  payload: FetchOpenOrdersPayload,
  requestId: string
) {
  try {
    const { email } = payload;
    const user = users[email];
    if (!user) {
      console.log(
        `Attempted to fetch open trades for non-existent user: ${email}`
      );
      await sendAcknowledgement(requestId, 'TRADE_FETCH_FAILED', {
        reason: 'User not found',
      });
      return;
    }

    const orders = user.trades.filter((trade: any) => trade.status === 'OPEN');
    await sendAcknowledgement(requestId, 'TRADE_FETCH_ACKNOWLEDGEMENT', {
      status: 'success',
      orders: orders,
    });
  } catch (err) {
    console.error('Error in handleFetchOpenOrders:', err);
    await sendAcknowledgement(requestId, 'SOMETHING_WENT_WRONG', {
      message: err,
    });
  }
}

export async function handleFetchCandlesticks(
  payload: FetchCandlesticksPayload,
  requestId: string
) {
  try {
    const { symbol, timeframe } = payload;

    // Convert frontend symbol format to backend format
    const backendSymbol = symbol.replace('USDT', '_USDC');

    const candlesticks = getCandlesticks(backendSymbol, timeframe as any);

    await sendAcknowledgement(requestId, 'CANDLESTICK_FETCH_ACKNOWLEDGEMENT', {
      status: 'success',
      candlesticks: candlesticks,
    });
  } catch (err) {
    await sendAcknowledgement(requestId, 'CANDLESTICK_FETCH_ERROR', {
      message: err,
    });
  }
}