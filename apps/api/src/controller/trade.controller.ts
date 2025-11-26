import type { Request, Response } from 'express';
import { RedisSubscriber } from '../services/redis.service.js';
import { closeOrderSchema, openOrderSchema } from '../validations/orderSchema.js';
import { randomUUID } from 'crypto';
import dbClient from '@exness-v3/db';
import { httpPusher } from '@exness-v3/redis/streams';

export const CREATE_ORDER_QUEUE = 'stream:engine';

const redisSubscriber = RedisSubscriber.getInstance();

export async function createOrder(req: Request, res: Response) {
  const { success, data, error } = openOrderSchema.safeParse(req.body);

  if (!success) {
    res.status(400).json({ error: error.flatten().fieldErrors });
    return;
  }

  const {
    asset,
    leverage,
    quantity,
    slippage,
    side,
    stopLoss,
    takeProfit,
    tradeOpeningPrice,
  } = data;
  try {
    const requestId = Date.now().toString();

    const payload = {
      type: 'CREATE_ORDER',
      requestId: requestId,
      data: JSON.stringify({
        email: req.user,
        trade: {
          id: randomUUID(),
          asset,
          quantity,
          side,
          leverage,
          slippage,
          stopLoss,
          takeProfit,
          tradeOpeningPrice,
        },
      }),
    };

    console.log('Sending CREATE_ORDER to Redis stream:', requestId);
    const streamId = await httpPusher.xAdd(CREATE_ORDER_QUEUE, '*', payload);
    console.log('Message sent to stream, ID:', streamId);

    console.log('Waiting for engine response...');
    const { tradeDetails } = await redisSubscriber.waitForMessage(requestId);
    console.log('Got response from engine:', tradeDetails);

    res.status(201).json({
      message: 'Order placed',
      trade: tradeDetails,
    });
  } catch (err: any) {
    console.log(err);
    res.status(500).json({
      message: 'Something went wrong',
      engine: err,
    });
  }
}

export async function closeOrder(req: Request, res: Response) {
  const { success, data } = closeOrderSchema.safeParse(req.body);

  if (!success) {
    res.status(400).json({ message: 'Orderid id missing ' });
    return;
  }

  const { orderId } = data;

  const requestId = Date.now().toString();

  const payload = {
    type: 'CLOSE_ORDER',
    requestId: requestId,
    data: JSON.stringify({
      email: req.user,
      orderId: orderId,
    }),
  };

  await httpPusher.xAdd(CREATE_ORDER_QUEUE, '*', payload);

  try {
    const { status, reason } = await redisSubscriber.waitForMessage(requestId);

    res.status(201).json({
      message: 'Order closed',
    });
  } catch (err: any) {
    console.log('err', err);
    res.status(500).json({
      message: 'Something went wrong: ' + err.reason,
    });
  }
}

export async function fetchCloseOrders(req: Request, res: Response) {
  const email = req.user;

  try {
    const user = await dbClient.user.findFirst({
      where: { email: email as string },
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    const orders = await dbClient.existingTrade.findMany({
      where: {
        userId: user.id,
      },
    });

    res.status(200).json({ orders });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
}

export async function fetchOpenOrders(req: Request, res: Response) {
  const email = req.user;

  try {
    const requestId = Date.now().toString();
    const payload = {
      type: 'FETCH_OPEN_ORDERS',
      requestId: requestId,
      data: JSON.stringify({
        email: email,
      }),
    };
    const res1 = await httpPusher.xAdd(CREATE_ORDER_QUEUE, '*', payload);
    console.log(res1);
    const { orders } = await redisSubscriber.waitForMessage(requestId);
    console.log(orders);
    res.status(200).json({ orders });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
}