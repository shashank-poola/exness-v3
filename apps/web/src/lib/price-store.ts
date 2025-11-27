export type PriceData = {
  ask: number;
  bid: number;
  time: number;
};

const priceStore = new Map<string, PriceData>();
const listeners = new Set<(symbol: string, data: PriceData) => void>();

export function setSymbolPrice(symbol: string, data: PriceData) {
  priceStore.set(symbol, data);
  listeners.forEach((cb) => cb(symbol, data));
}

export function getSymbolPrice(symbol: string): PriceData | undefined {
  return priceStore.get(symbol);
}

export function getAllPrices(): Record<string, PriceData> {
  const result: Record<string, PriceData> = {};
  priceStore.forEach((value, key) => {
    result[key] = value;
  });
  return result;
}

export function subscribePriceUpdates(
  cb: (symbol: string, data: PriceData) => void
) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
