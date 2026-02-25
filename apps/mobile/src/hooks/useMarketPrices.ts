import React, { useEffect, useState } from "react";

import { env } from "../config/env";

export type PriceData = {
  ask: number;
  bid: number;
  time: number;
};

type PriceMap = Record<string, PriceData>;

interface AggregatedPricePayload {
  type: "PRICE_UPDATE";
  data: string;
}

interface AggregatedEntry {
  buyPrice: number;
  sellPrice: number;
  decimal: number;
}

interface LegacyTradeMessage {
  type: "ASK" | "BID";
  symbol: string;
  price: number;
  originalPrice?: number;
  quantity?: number;
  time?: number;
}

function mapPairToUiSymbol(pair: string): string {
  const compact = pair.replace("_", "");
  if (compact.endsWith("USDC")) return compact.replace("USDC", "USDT");
  return compact;
}

export type PriceTickCallback = (symbol: string, price: number, time: number) => void;

export function useMarketPrices(onTick?: PriceTickCallback) {
  const [prices, setPrices] = useState<PriceMap>({});
  const onTickRef = React.useRef(onTick);
  onTickRef.current = onTick;

  useEffect(() => {
    const wsUrl = env.EXPO_PUBLIC_WS_URL;
    if (!wsUrl) {
      return;
    }

    let isMounted = true;
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      if (!isMounted) return;

      try {
        const parsed = JSON.parse(event.data) as
          | AggregatedPricePayload
          | LegacyTradeMessage;

        // Aggregated PRICE_UPDATE payload with many pairs
        if (
          (parsed as AggregatedPricePayload).type === "PRICE_UPDATE" &&
          typeof (parsed as AggregatedPricePayload).data === "string"
        ) {
          const priceMap = JSON.parse(
            (parsed as AggregatedPricePayload).data
          ) as Record<string, AggregatedEntry>;

          const now = Date.now();

          setPrices((prev) => {
            const next: PriceMap = { ...prev };

            Object.entries(priceMap).forEach(([pair, p]) => {
              const scale = Math.pow(10, p.decimal || 0);
              const ask = p.buyPrice / scale;
              const bid = p.sellPrice / scale;
              const symbol = mapPairToUiSymbol(pair);
              const mid = (ask + bid) / 2;

              next[symbol] = { ask, bid, time: now };
              onTickRef.current?.(symbol, mid, now);
            });

            return next;
          });

          return;
        }

        // Legacy single tick messages
        if (
          (parsed as LegacyTradeMessage).symbol &&
          (parsed as LegacyTradeMessage).price &&
          (parsed as LegacyTradeMessage).type
        ) {
          const msg = parsed as LegacyTradeMessage;
          const key = msg.symbol;
          const now = msg.time || Date.now();

          setPrices((prev) => {
            const current = prev[key] || {
              ask: 0,
              bid: 0,
              time: now,
            };

            const ask =
              msg.type === "ASK" ? msg.price : current.ask || msg.price;
            const bid =
              msg.type === "BID" ? msg.price : current.bid || msg.price;
            const mid = ask && bid ? (ask + bid) / 2 : ask || bid;

            if (mid > 0) onTickRef.current?.(key, mid, now);

            return {
              ...prev,
              [key]: {
                ask,
                bid,
                time: now,
              },
            };
          });
        }
      } catch {
        // Ignore malformed messages
      }
    };

    ws.onerror = () => {
      // Silent error; UI can handle missing prices
    };

    return () => {
      isMounted = false;
      ws.close();
    };
  }, []);

  return prices;
}

