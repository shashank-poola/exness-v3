import type { Candlestick } from "../types/candle.type";

export type TimeframeKey =
  | "1m"
  | "5m"
  | "30m"
  | "1h"
  | "6h"
  | "1d"
  | "3d";

const TIMEFRAME_MS: Record<TimeframeKey, number> = {
  "1m": 60 * 1000,
  "5m": 5 * 60 * 1000,
  "30m": 30 * 60 * 1000,
  "1h": 60 * 60 * 1000,
  "6h": 6 * 60 * 60 * 1000,
  "1d": 24 * 60 * 60 * 1000,
  "3d": 3 * 24 * 60 * 60 * 1000,
};

const TIMEFRAMES: TimeframeKey[] = [
  "1m",
  "5m",
  "30m",
  "1h",
  "6h",
  "1d",
  "3d",
];

const candleStore: Record<string, Record<string, Candlestick[]>> = {};

function getCandleTime(timestamp: number, intervalMs: number): number {
  return Math.floor(timestamp / intervalMs) * intervalMs;
}

export function updateCandlestick(
  symbol: string,
  timeframe: TimeframeKey,
  price: number,
  timestamp: number
): void {
  const intervalMs = TIMEFRAME_MS[timeframe];
  const candleTime = getCandleTime(timestamp, intervalMs);
  const candleTimeSec = Math.floor(candleTime / 1000);

  if (!candleStore[symbol]) {
    candleStore[symbol] = {};
  }
  if (!candleStore[symbol][timeframe]) {
    candleStore[symbol][timeframe] = [];
  }

  const candles = candleStore[symbol][timeframe];
  const lastCandle = candles[candles.length - 1];

  if (!lastCandle || lastCandle.time < candleTimeSec) {
    candles.push({
      time: candleTimeSec,
      open: price,
      high: price,
      low: price,
      close: price,
    });
    if (candles.length > 1000) candles.shift();
  } else if (lastCandle.time === candleTimeSec) {
    lastCandle.high = Math.max(lastCandle.high, price);
    lastCandle.low = Math.min(lastCandle.low, price);
    lastCandle.close = price;
  }
}

export function getCandlesticks(
  symbol: string,
  timeframe: string
): Candlestick[] {
  if (!candleStore[symbol] || !candleStore[symbol][timeframe]) {
    return [];
  }
  return candleStore[symbol][timeframe];
}

export function clearCandlesticks(
  symbol: string,
  timeframe: TimeframeKey
): void {
  if (candleStore[symbol]?.[timeframe]) {
    candleStore[symbol][timeframe] = [];
  }
}

export interface PriceTickMessage {
  symbol: string;
  price: number;
  time: number;
}

export function processPriceTick(msg: PriceTickMessage): void {
  const price = msg.price;
  const time = msg.time;
  TIMEFRAMES.forEach((tf) => {
    updateCandlestick(msg.symbol, tf, price, time);
  });
}
