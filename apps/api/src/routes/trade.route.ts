import express from 'express';
import {
  closeOrder,
  createOrder,
  fetchCloseOrders,
  fetchOpenOrders,
  fetchCandlesticks,
} from '../controller/trade.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const tradeRouter = express();

tradeRouter.post('/create-order', authMiddleware, createOrder);
tradeRouter.post('/close-order', authMiddleware, closeOrder);
tradeRouter.get('/get-open-orders', authMiddleware, fetchOpenOrders);
tradeRouter.get('/get-close-orders', authMiddleware, fetchCloseOrders);
tradeRouter.get('/candlesticks', fetchCandlesticks);

export default tradeRouter;