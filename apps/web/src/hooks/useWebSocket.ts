import { useEffect, useRef } from 'react';
import { setSymbolPrice } from '@/lib/price-store';

export interface TradeMessage {
  type: 'ASK' | 'BID';
  symbol: string;
  price: number;
  originalPrice: number;
  quantity: number;
  time: number;
}

// Keep a shared connection outside the hook
let ws: WebSocket | null = null;
let listeners: ((msg: TradeMessage) => void)[] = [];
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8080';

export function useWebSocket(onMessage: (msg: TradeMessage) => void) {
  // Store the latest callback in a ref to avoid reconnections
  const callbackRef = useRef(onMessage);

  useEffect(() => {
    callbackRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    // Wrapper function that calls the latest callback
    const stableCallback = (msg: TradeMessage) => {
      callbackRef.current(msg);
    };

    // Create socket only once
    if (!ws) {
      console.log('🔌 Connecting to WebSocket:', WS_URL);
      ws = new WebSocket(WS_URL);

      ws.onopen = () => {
        console.log('✅ WebSocket connected');
      };

      ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);

          // Handle aggregated PRICE_UPDATE payloads from ws service
          if (
            parsed &&
            parsed.type === 'PRICE_UPDATE' &&
            typeof parsed.data === 'string'
          ) {
            const priceMap = JSON.parse(parsed.data) as Record<
              string,
              { buyPrice: number; sellPrice: number; decimal: number }
            >;

            const now = Date.now();

            Object.entries(priceMap).forEach(([pair, p]) => {
              const scale = Math.pow(10, p.decimal || 0);
              const ask = p.buyPrice / scale; // Price to buy at
              const bid = p.sellPrice / scale; // Price to sell at

              const symbol = mapPairToUiSymbol(pair);

              // Update shared price store
              setSymbolPrice(symbol, { ask, bid, time: now });

              const askMsg: TradeMessage = {
                type: 'ASK',
                symbol,
                price: ask,
                originalPrice: ask,
                quantity: 0,
                time: now,
              };
              const bidMsg: TradeMessage = {
                type: 'BID',
                symbol,
                price: bid,
                originalPrice: bid,
                quantity: 0,
                time: now,
              };

              listeners.forEach((cb) => cb(askMsg));
              listeners.forEach((cb) => cb(bidMsg));
            });

            return;
          }

          // Fallback for legacy single-tick messages
          if (parsed && parsed.type && parsed.symbol && parsed.price) {
            listeners.forEach((cb) => cb(parsed as TradeMessage));
            return;
          }
        } catch (err) {
          console.error('❌ WS parse error:', err);
        }
      };

      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log('🔌 WebSocket closed');
        ws = null;
        listeners = [];

        // Auto-reconnect after 3 seconds
        setTimeout(() => {
          console.log('🔄 Reconnecting...');
          if (listeners.length > 0) {
            // Only reconnect if there are active listeners
            ws = null; // Reset to trigger reconnection
          }
        }, 3000);
      };
    }

    // Register listener for this hook call
    listeners.push(stableCallback);

    // Cleanup when component unmounts
    return () => {
      listeners = listeners.filter((cb) => cb !== stableCallback);

      // If no more listeners, close connection
      if (listeners.length === 0 && ws) {
        ws.close();
        ws = null;
      }
    };
  }, []);
}

function mapPairToUiSymbol(pair: string): string {
  // Example inputs: BTC_USDC, ETH_USDC, SOL_USDC
  // UI expects: BTCUSDT, ETHUSDT, SOLUSDT (for Binance compatibility)
  const compact = pair.replace('_', '');
  if (compact.endsWith('USDC')) return compact.replace('USDC', 'USDT');
  return compact;
}
