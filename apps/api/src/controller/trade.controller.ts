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
    res.status(400).json({
      success: false,
      message: null,
      error: error.flatten().fieldErrors 
    })
    return;
  }

  const { asset, leverage, quantity, slippage, side, stopLoss, takeProfit, tradeOpeningPrice } = data;
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

    const streamId = await httpPusher.xAdd(CREATE_ORDER_QUEUE, '*', payload);

    const { tradeDetails } = await redisSubscriber.waitForMessage(requestId);

    res.status(201).json({
      success: true,
      message: 'ORDER_PLACED',
      error: null,
      trade: tradeDetails,
    })

  } catch (err) {
    res.status(500).json({
      success: false,
      message: null,
      error: 'INTERNAL_SERVER_ERROR',
      engine: err,
    })
    return;
  }
}

export async function closeOrder(req: Request, res: Response) {
  const { success, data } = closeOrderSchema.safeParse(req.body);

  if (!success) {
    res.status(400).json({
      success: false, 
      message: null,
      error: 'ORDER_DETAILS_MISSING',
    })
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

    return res.status(201).json({
      success: true,
      message: 'ORDER_CLOSED_SUCCESSFULLY',
      error: null,
    });

  } catch (err) {
    console.log('err', err);
    
    res.status(500).json({
      success: false,
      message: null,
      error: "INTERNAL_SERVER_ERROR"
    })
    return;
  }
}

export async function fetchCloseOrders(req: Request, res: Response) {
  try {
    const email = req.user;

    const user = await dbClient.user.findFirst({
      where: { email: email as string },
    });

    if (!user) {
      res.status(404).json({ 
        success: false,
        message: null,
        error: "USER_NOT_FOUND"
      })
      return;
    }

    const orders = await dbClient.existingTrade.findMany({
      where: {
        userId: user.id,
      },
    });

    return res.status(200).json({
      success: true,
      message: orders,
      error: null,
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ 
      success: false,
      message: null,
      error: "INTERNAL_SERVER_ERROR"
    })
    return;
  }
}

export async function fetchOpenOrders(req: Request, res: Response) {
  try {
    const email = req.user;

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

    return res.status(200).json({
      success: true, 
      message: orders,
      error: null,
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: null,
      error: 'INTERNAL_SERVER_ERROR'
    })
    return;
  }
}

export async function fetchCandlesticks(req: Request, res: Response) {
  try {
    const { symbol, timeframe } = req.query;

    if (!symbol || !timeframe) {
      res.status(400).json({
        success: false,
        message: null,
        error: 'SYMBOL_AND_TIMEFRAME_REQUIRED' 
      })
      return;
    }

    const requestId = Date.now().toString();

    const payload = {
      type: 'FETCH_CANDLESTICKS',
      requestId: requestId,
      data: JSON.stringify({
        symbol: symbol as string,
        timeframe: timeframe as string,
      }),
    };

    const streamResult = await httpPusher.xAdd(CREATE_ORDER_QUEUE, '*', payload);

    const { candlesticks } = await redisSubscriber.waitForMessage(requestId);

    res.status(200).json({ 
      success: true,
      message: candlesticks,
      error: null,
    });

  } catch (err) {
    console.error('Error fetching candlesticks:', err);
    res.status(500).json({
      success: false,
      message: null,
      error: 'INTERNAL_SERVER_ERROR'
    })
    return;
  }
}