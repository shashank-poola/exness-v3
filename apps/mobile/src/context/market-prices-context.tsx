import React, { createContext, useCallback, useContext, useRef, useState } from "react";
import { env } from "../config/env";

export type PriceData = {
  ask: number;
  bid: number;
  time: number;
};

export type PriceMap = Record<string, PriceData>;

export type PriceTickCallback = (symbol: string, price: number, time: number) => void;

function getWsUrl(): string | undefined {
  const url = env.EXPO_PUBLIC_WS_URL;
  if (!url) return undefined;
  if (url.includes(":3000")) return url.replace(":3000", ":8080").replace(/\/ws.*$/, "");
  return url;
}

function mapPairToUiSymbol(pair: string): string {
  const compact = pair.replace(/_/g, "");
  const usdcIndex = compact.indexOf("USDC");
  if (usdcIndex !== -1) {
    const base = compact.slice(0, usdcIndex);
    return `${base}USDT`;
  }
  return compact;
}

interface AggregatedEntry {
  buyPrice: number;
  sellPrice: number;
  decimal: number;
}

interface AggregatedPricePayload {
  type: "PRICE_UPDATE";
  data: string;
}

interface LegacyTradeMessage {
  type: "ASK" | "BID";
  symbol: string;
  price: number;
  time?: number;
}

type MarketPricesContextValue = {
  prices: PriceMap;
  registerTickCallback: (cb: PriceTickCallback) => () => void;
};

export const MarketPricesContext = createContext<MarketPricesContextValue | null>(null);

export function MarketPricesProvider({ children }: { children: React.ReactNode }) {
  const [prices, setPrices] = useState<PriceMap>({});
  const tickCallbacksRef = useRef<Set<PriceTickCallback>>(new Set());

  const registerTickCallback = useCallback((cb: PriceTickCallback) => {
    tickCallbacksRef.current.add(cb);
    return () => {
      tickCallbacksRef.current.delete(cb);
    };
  }, []);

  React.useEffect(() => {
    const wsUrl = getWsUrl();
    if (!wsUrl) return;

    let isMounted = true;
    let ws: WebSocket | null = null;
    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;

    function connect() {
      if (!isMounted || !wsUrl) return;
      ws = new WebSocket(wsUrl);

      ws.onmessage = (event) => {
        if (!isMounted) return;
        try {
          const parsed = JSON.parse(event.data) as AggregatedPricePayload | LegacyTradeMessage;

          if (
            (parsed as AggregatedPricePayload).type === "PRICE_UPDATE" &&
            typeof (parsed as AggregatedPricePayload).data === "string"
          ) {
            const priceMap = JSON.parse((parsed as AggregatedPricePayload).data) as Record<
              string,
              AggregatedEntry
            >;
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
                tickCallbacksRef.current.forEach((cb) => cb(symbol, mid, now));
              });
              return next;
            });
            return;
          }

          if (
            (parsed as LegacyTradeMessage).symbol &&
            (parsed as LegacyTradeMessage).price != null &&
            (parsed as LegacyTradeMessage).type
          ) {
            const msg = parsed as LegacyTradeMessage;
            const key = msg.symbol;
            const now = msg.time ?? Date.now();

            setPrices((prev) => {
              const current = prev[key] || { ask: 0, bid: 0, time: now };
              const ask = msg.type === "ASK" ? msg.price : current.ask || msg.price;
              const bid = msg.type === "BID" ? msg.price : current.bid || msg.price;
              const mid = ask && bid ? (ask + bid) / 2 : ask || bid;
              if (mid > 0) tickCallbacksRef.current.forEach((cb) => cb(key, mid, now));
              return {
                ...prev,
                [key]: { ask, bid, time: now },
              };
            });
          }
        } catch {
          // ignore
        }
      };

      ws.onclose = () => {
        ws = null;
        if (!isMounted) return;
        reconnectTimeout = setTimeout(connect, 3000);
      };

      ws.onerror = () => {};
    }

    connect();
    return () => {
      isMounted = false;
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (ws) ws.close();
    };
  }, []);

  const value: MarketPricesContextValue = React.useMemo(
    () => ({ prices, registerTickCallback }),
    [prices, registerTickCallback]
  );

  return (
    <MarketPricesContext.Provider value={value}>
      {children}
    </MarketPricesContext.Provider>
  );
}

export function useMarketPricesContext(): MarketPricesContextValue {
  const ctx = useContext(MarketPricesContext);
  if (!ctx) throw new Error("useMarketPricesContext must be used within MarketPricesProvider");
  return ctx;
}
