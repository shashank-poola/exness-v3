import type { Request, Response } from 'express';
import { getUserBalanceFromEngine } from '../services/engine.service.js';
import dbClient from '@exness-v3/db';

export async function getUserBalance(req: Request, res: Response) {
  try {
    const email = req.user;

    if (!email) {
      res.status(401).json({
        success: false,
        message: null,
        error: 'UNAUTHORIZED_EMAIL',
      });
      return;
    }

    const user = await dbClient.user.findFirst({
      where: {
        email: email as string,
      },
      select: {
        balance: true,
        email: true,
        password: true,
      },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: null,
        error: 'USER_NOT_FOUND',
      });
      return;
    }

    try {
      const engineBalance = await getUserBalanceFromEngine(
        user.email,
        user.password
      );

      console.log('[BALANCE] Engine balance for', user.email, engineBalance);

      return res.status(200).json({
        success: true,
        message: Number(engineBalance),
        error: null,
      });
    } catch (engineErr) {
      console.log('[BALANCE] Failed to get balance from engine, falling back to DB:', engineErr);

      return res.status(200).json({
        success: true,
        message: Number(user.balance) || 0,
        error: null,
      });
    }
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: null,
      error: 'INTERNAL_SERVER_ERROR',
    });
    return;
  }
}