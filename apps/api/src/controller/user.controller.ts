import type { Request, Response } from 'express';
import { getUserBalanceFromEngine } from '../services/engine.service';

export async function getUserBalance(req: Request, res: Response) {
  try {
    const email = req.user;

    if (!email) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const balance = await getUserBalanceFromEngine(req.user);
    res.status(200).json({
      balance: balance,
    });
  } catch (err: any) {
    console.log(err);
    res.status(500).json({ message: 'Interal server error' });
  }
}