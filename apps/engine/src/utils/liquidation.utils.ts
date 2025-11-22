import type { AsksBids, Trade, User } from '../types';
import prisma from '@exness-v3/db';

export async function closeOrder(
  user: User,
  orderId: string,
  realizedPnl: number,
  reason: string,
  currentPrice: AsksBids
) {
  const tradeIndex = user.trades.findIndex((trade) => trade.id === orderId);
  if (tradeIndex === -1) {
    return;
  }

  const [closedTrade] = user.trades.splice(tradeIndex, 1);

  const { asset, side, openPrice, quantity, margin, leverage, slippage } =
    closedTrade;

  const closePrice =
    side === 'LONG'
      ? currentPrice.sellPrice / 10 ** currentPrice.decimal
      : currentPrice.buyPrice / 10 ** currentPrice.decimal;

  user.balance.amount += margin + realizedPnl;
  closedTrade.status = 'CLOSED';
  closedTrade.closePrice = closePrice;
  closedTrade.pnl = realizedPnl;
  closedTrade.closedAt = new Date();

  await prisma.existingTrade.create({
    data: {
      quantity,
      side,
      userId: user.id,
      asset,
      openPrice,
      closePrice,
      leverage,
      pnl: realizedPnl,
      liquidated: reason === 'Liquidation',
      createdAt: new Date(),
      slippage,
      reason,
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
}

export function calculatePnl(order: Trade, closePrice: number): number {
  const { side, openPrice, quantity, leverage } = order;
  if (side === 'LONG') {
    return (closePrice - openPrice) * quantity * leverage;
  } else {
    return (openPrice - closePrice) * quantity * leverage;
  }
}