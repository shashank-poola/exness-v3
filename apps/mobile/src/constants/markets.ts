export const SUPPORTED_SYMBOLS = ["BTC", "ETH", "SOL"] as const;
export type SupportedSymbol = (typeof SUPPORTED_SYMBOLS)[number];

export const SYMBOL_TO_PAIR: Record<SupportedSymbol, string> = {
  BTC: "BTC/USD",
  ETH: "ETH/USD",
  SOL: "SOL/USD",
};

export const SYMBOL_TO_WS_SYMBOL: Record<SupportedSymbol, string> = {
  BTC: "BTCUSDT",
  ETH: "ETHUSDT",
  SOL: "SOLUSDT",
};

export const ASSET_TO_SYMBOL: Record<string, SupportedSymbol> = {
  BTC_USDC: "BTC",
  ETH_USDC: "ETH",
  SOL_USDC: "SOL",
};

export const ASSET_TO_WS_SYMBOL: Record<string, string> = {
  BTC_USDC: "BTCUSDT",
  ETH_USDC: "ETHUSDT",
  SOL_USDC: "SOLUSDT",
};

export const SYMBOL_ICON_MAP: Record<SupportedSymbol, any> = {
  BTC: require("../../assets/images/exness/btc.png"),
  ETH: require("../../assets/images/exness/eth.png"),
  SOL: require("../../assets/images/exness/solana.png"),
};

export const CHART_DEFAULT_HEIGHT = 260;
export const MERGE_INTERVAL_MS = 1000;

