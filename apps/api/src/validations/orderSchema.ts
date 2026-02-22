import { z } from 'zod';

export const openOrderSchema = z.object({
  asset: z.string(),
  side: z.enum(['LONG', 'SHORT']),
  quantity: z.number(),
  leverage: z.number().default(1),
  slippage: z.number().default(1),
  tradeOpeningPrice: z.number(),
  takeProfit: z.number().optional(),
  stopLoss: z.number().optional(),
});

export const closeOrderSchema = z.object({
  orderId: z.string().min(1, 'ORDER_ID_REQUIRED')
});