import express from 'express';
import authRouter from './auth.route.js';
import tradeRouter from './trade.route.js';
import balanceRouter from './balance.route.js';

const mainRouter = express();

mainRouter.use('/auth', authRouter);
mainRouter.use('/trade', tradeRouter);
mainRouter.use('/balance', balanceRouter);

export default mainRouter;