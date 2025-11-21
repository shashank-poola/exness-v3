import express from 'express';
import { getUserBalance } from '../controller/user.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const balanceRouter = express();

balanceRouter.get('/me', authMiddleware, getUserBalance);

export default balanceRouter;