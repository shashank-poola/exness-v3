import { engineResponsePuller } from '@exness-v3/redis/streams';
import type { CallbackEntry, EngineMessage, StreamResponse } from '../types/index.js';

export const ACKNOWLEDGEMENT_QUEUE = 'stream:engine:acknowledgement';

const RESPONSE_TIMEOUT_MS = 5000;

const SUCCESS_RESPONSE_TYPES = new Set([
  'USER_CREATED_SUCCESS',
  'TRADE_OPEN_ACKNOWLEDGEMENT',
  'TRADE_CLOSE_ACKNOWLEDGEMENT',
  'GET_BALANCE_ACKNOWLEDGEMENT',
  'TRADE_FETCH_ACKNOWLEDGEMENT',
  'CANDLESTICK_FETCH_ACKNOWLEDGEMENT',
  'USER_ALREADY_EXISTS',
]);

const FAILURE_RESPONSE_TYPES = new Set([
  'USER_CREATION_FAILED',
  'USER_CREATION_ERROR',
  'TRADE_OPEN_FAILED',
  'TRADE_OPEN_ERROR',
  'GET_BALANCE_FAILED',
  'GET_BALANCE_ERROR',
  'TRADE_CLOSE_FAILED',
  'TRADE_SLIPPAGE_MAX_EXCEEDED',
  'TRADE_FETCH_FAILED',
  'CANDLESTICK_FETCH_ERROR',
  'SOMETHING_WENT_WRONG',
]);

engineResponsePuller.connect().catch((err) => {
  console.error('[RedisSubscriber] Failed to connect:', err);
});

export class RedisSubscriber {                                   //Redis subscriber
  private static instance: RedisSubscriber;
  private callbacks: Record<string, CallbackEntry> = {};

  private constructor() {
    this.startMessageLoop();
  }

  static getInstance(): RedisSubscriber {
    if (!RedisSubscriber.instance) {
      RedisSubscriber.instance = new RedisSubscriber();
    }
    return RedisSubscriber.instance;
  }

  private async startMessageLoop(): Promise<void> {
    while (true) {
      try {
        const response = await engineResponsePuller.xRead(
          { key: ACKNOWLEDGEMENT_QUEUE, id: '$' },
          { BLOCK: 0 }
        );

        if (response) {
          this.handleMessage(response as unknown as [StreamResponse]);
        }
      } catch (err) {
        console.error('[RedisSubscriber] Message loop error:', err);
        await new Promise((r) => setTimeout(r, 1000));
      }
    }
  }

  private handleMessage(response: [StreamResponse]): void {
    const stream = response[0];
    const firstMessage = stream?.messages?.[0]?.message;

    if (!firstMessage) return;

    const { type, requestId, payload } = firstMessage;
    const callback = this.callbacks[requestId];

    if (!callback) return;

    delete this.callbacks[requestId];

    let parsedPayload: unknown;
    try {
      parsedPayload = JSON.parse(payload);
    } catch {
      callback.reject(new Error('Invalid JSON in engine response'));
      return;
    }

    if (SUCCESS_RESPONSE_TYPES.has(type)) {
      callback.resolve(parsedPayload);

    } else if (FAILURE_RESPONSE_TYPES.has(type)) {
      callback.reject(parsedPayload);

    } else {
      console.warn('[RedisSubscriber] Unknown response type:', type);
      
      callback.reject(new Error(`Unknown response type: ${type}`));
    }
  }

  waitForMessage<T = unknown>(requestId: string): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.callbacks[requestId] = {
        resolve: (value: unknown) => resolve(value as T),
        reject,
      };
  
      setTimeout(() => {
        if (this.callbacks[requestId]) {
          delete this.callbacks[requestId];
          reject(new Error(`Engine response timed out after ${RESPONSE_TIMEOUT_MS}ms`));
        }
      }, RESPONSE_TIMEOUT_MS);
    });
  }
}