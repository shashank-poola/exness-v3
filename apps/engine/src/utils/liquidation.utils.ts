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
  if (!closedTrade) {
    throw new Error('Tried to close a trade that does not exist');
  }
  const { asset, side, openPrice, quantity, margin, leverage, slippage } = closedTrade;

  const closePrice =
    side === 'LONG'
      ? currentPrice.sellPrice / 10 ** currentPrice.decimal
      : currentPrice.buyPrice / 10 ** currentPrice.decimal;

  const newBalance = Math.round(user.balance.amount + margin + realizedPnl);

  const dbUser = await prisma.user.findUnique({
    where: { email: user.email },
  });
  if (!dbUser) {
    throw new Error(`Liquidation: no DB user for ${user.email}`);
  }

  await prisma.$transaction([
    prisma.existingTrade.create({
      data: {
        quantity,
        side,
        userId: dbUser.id,
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
    }),
    prisma.user.update({
      where: { id: dbUser.id },
      data: { balance: newBalance },
    }),
  ]);

  user.balance.amount = newBalance;
  closedTrade.status = 'CLOSED';
  closedTrade.closePrice = closePrice;
  closedTrade.pnl = realizedPnl;
  closedTrade.closedAt = new Date();
}

export function calculatePnl(order: Trade, closePrice: number): number {
  const { side, openPrice, quantity, leverage } = order;
  if (side === 'LONG') {
    return (closePrice - openPrice) * quantity * leverage;
  } else {
    return (openPrice - closePrice) * quantity * leverage;
  }
}