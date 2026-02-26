import {type SupportedSymbol } from "@/src/constants/markets";
import { ViewStyle, TextStyle } from "react-native";

export interface Candlestick {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
};

export type Side = "BUY" | "SELL";

export interface CandlesticksResponse {
    candlesticks: Candlestick[];
};

export interface PriceChartProps {
    symbol: string;
    timeframe: string;
    height?: number;
};

export interface TradingViewChartProps {
    candles: Candlestick[];
    width: number;
    height: number;
};

export type LeverageSliderProps = {
    value: number;
    onChange: (val: number) => void;
    min?: number;
    max?: number;
};

export const SYMBOL_TO_ASSET: Record<SupportedSymbol, string> = {
    BTC: "BTC_USDC",
    ETH: "ETH_USDC",
    SOL: "SOL_USDC",
};

export interface TimeframeStyles {
    container: ViewStyle;
    chip: ViewStyle;
    chipActive: ViewStyle;
    label: TextStyle;
    labelActive: TextStyle;
}