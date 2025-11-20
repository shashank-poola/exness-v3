import z from 'zod';

export const openOrderSchema = z.object({
  asset: z.string(),
  side: z.enum(['LONG', 'SHORT']),
  quantity: z.number(),
  leverage: z.number().default(1),
  slippage: z.number(),
  tradeOpeningPrice: z.number(),
  takeProfit: z.number().optional(),
  stopLoss: z.number().optional(),
});

export const closeOrderSchema = z.object({
  orderId: z.string(),
});