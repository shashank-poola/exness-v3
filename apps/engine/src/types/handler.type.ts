import type { Trade } from '.';

export interface UserCreated {
  email: string;
  id: string;
  balance: number;
}

export interface CloseOrderPayload {
  email: string;
  orderId: string;
}

export interface OpenTradePayload {
  email: string;
  trade: Trade;
}

export interface UserPayload {
  email: string;
  password: string;
}

export interface FetchOpenOrdersPayload {
  email: string;
}