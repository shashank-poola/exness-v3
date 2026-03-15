import React, { useContext, useEffect } from "react";
import {
  MarketPricesContext,
  type PriceData,
  type PriceTickCallback,
} from "../context/market-prices-context";

export type { PriceData, PriceTickCallback };

export function useMarketPrices(onTick?: PriceTickCallback): Record<string, PriceData> {
  const ctx = useContext(MarketPricesContext);

  useEffect(() => {
    if (!ctx || !onTick) return;
    return ctx.registerTickCallback(onTick);
  }, [ctx, onTick]);

  return ctx?.prices ?? {};
}
