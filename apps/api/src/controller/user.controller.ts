import type { Request, Response } from 'express';
import { getUserBalanceFromEngine } from '../services/engine.service.js';
import dbClient from '@exness-v3/db';

export async function getUserBalance(req: Request, res: Response) {
  try {
    const email = req.user;

    if (!email) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Get balance directly from database
    const user = await dbClient.user.findFirst({
      where: { email: email as string },
      select: { balance: true, email: true },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.status(200).json({
      balance: Number(user.balance) || 10000, // Ensure it's a number, default to 10000
    });
  } catch (err: any) {
    console.log(err);
    res.status(500).json({ message: 'Internal server error' });
  }
}