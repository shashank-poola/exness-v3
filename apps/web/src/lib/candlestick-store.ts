import { TradeMessage } from '@/hooks/useWebSocket';

export interface Candlestick {
  time: number; // Unix timestamp in seconds
  open: number;
  high: number;
  low: number;
  close: number;
}

type TimeframeMs = {
  '1m': number;
  '5m': number;
  '30m': number;
  '1h': number;
  '6h': number;
  '1d': number;
  '3d': number;
};

const TIMEFRAME_MS: TimeframeMs = {
  '1m': 60 * 1000,
  '5m': 5 * 60 * 1000,
  '30m': 30 * 60 * 1000,
  '1h': 60 * 60 * 1000,
  '6h': 6 * 60 * 60 * 1000,
  '1d': 24 * 60 * 60 * 1000,
  '3d': 3 * 24 * 60 * 60 * 1000,
};

// Store candles per symbol and timeframe in memory only
const candleStore: Record<string, Record<string, Candlestick[]>> = {};

// Get the candle timestamp (start of the candle period)
function getCandleTime(timestamp: number, intervalMs: number): number {
  return Math.floor(timestamp / intervalMs) * intervalMs;
}


export function updateCandlestick(
  symbol: string,
  timeframe: keyof TimeframeMs,
  price: number,
  timestamp: number
) {
  const intervalMs = TIMEFRAME_MS[timeframe];
  const candleTime = getCandleTime(timestamp, intervalMs);
  const candleTimeSec = Math.floor(candleTime / 1000);

  // Initialize symbol storage
  if (!candleStore[symbol]) {
    candleStore[symbol] = {};
  }

  // Initialize timeframe storage
  if (!candleStore[symbol][timeframe]) {
    candleStore[symbol][timeframe] = [];
  }

  const candles = candleStore[symbol][timeframe];
  const lastCandle = candles[candles.length - 1];

  // Check if we need to create a new candle or update existing
  if (!lastCandle || lastCandle.time < candleTimeSec) {
    // Create new candle
    const newCandle: Candlestick = {
      time: candleTimeSec,
      open: price,
      high: price,
      low: price,
      close: price,
    };
    candles.push(newCandle);

    // Keep only last 1000 candles to avoid memory issues
    if (candles.length > 1000) {
      candles.shift();
    }
  } else if (lastCandle.time === candleTimeSec) {
    // Update existing candle
    lastCandle.high = Math.max(lastCandle.high, price);
    lastCandle.low = Math.min(lastCandle.low, price);
    lastCandle.close = price;
  }
}

export function getCandlesticks(
  symbol: string,
  timeframe: keyof TimeframeMs
): Candlestick[] {
  if (!candleStore[symbol] || !candleStore[symbol][timeframe]) {
    return [];
  }
  return candleStore[symbol][timeframe];
}

export function clearCandlesticks(symbol: string, timeframe: keyof TimeframeMs) {
  if (candleStore[symbol] && candleStore[symbol][timeframe]) {
    candleStore[symbol][timeframe] = [];
  }
}

// Process WebSocket message and update all timeframes
export function processPriceTick(msg: TradeMessage) {
  const timeframes: (keyof TimeframeMs)[] = ['1m', '5m', '30m', '1h', '6h', '1d', '3d'];

  // Use mid price (average of bid and ask) for candles
  // In a real scenario, you might want to use actual trade prices
  const price = msg.price;

  timeframes.forEach((tf) => {
    updateCandlestick(msg.symbol, tf, price, msg.time);
  });
}
