import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { getCandlesticksService } from "../services/trade.service";
import type { Candlestick } from "../types/candle.type";

function mapIntervalToBinance(interval: string): string {
  if (interval === "10m") return "15m";
  return interval;
}

async function fetchBinanceKlines(
  symbol: string,
  interval: string
): Promise<Candlestick[]> {
  const mapped = mapIntervalToBinance(interval);
  const params = new URLSearchParams({
    symbol,
    interval: mapped,
    limit: "500",
  });
  const res = await fetch(
    `https://fapi.binance.com/fapi/v1/klines?${params.toString()}`
  );
  if (!res.ok) throw new Error(`Binance klines: ${res.statusText}`);
  const klines: unknown[] = await res.json();
  return (klines as [number, string, string, string, string, ...unknown[]][]).map(
    (k) => ({
      time: Math.floor(k[0] / 1000),
      open: parseFloat(k[1]),
      high: parseFloat(k[2]),
      low: parseFloat(k[3]),
      close: parseFloat(k[4]),
    })
  );
}

export function useCandlesticks(symbol: string, timeframe: string) {
  return useQuery<Candlestick[]>({
    queryKey: ["candlesticks", symbol, timeframe],
    queryFn: async () => {
      try {
        const result = await getCandlesticksService(symbol, timeframe);
        if (result.success && result.data) {
          const raw = result.data as { candlesticks?: Candlestick[]; message?: Candlestick[] };
          const list = raw.candlesticks ?? raw.message;
          if (Array.isArray(list) && list.length > 0) return list;
        }
      } catch {
        // Backend failed (e.g. 500) or returned empty — use Binance fallback
      }
      return fetchBinanceKlines(symbol, timeframe);
    },
    refetchInterval: 5000,
    staleTime: 2000,
    retry: 1,
  });
}

export function useCandlestickChangePercent(symbol: string, timeframe: string) {
  const { data, ...rest } = useCandlesticks(symbol, timeframe);

  const changePercent = useMemo(() => {
    if (!data || data.length < 2) return 0;
    const first = data[0];
    const last = data[data.length - 1];
    if (!first.open) return 0;

    const diff = last.close - first.open;
    return (diff / first.open) * 100;
  }, [data]);

  return { changePercent, ...rest };
}

