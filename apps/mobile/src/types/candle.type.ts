export interface Candlestick {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
};

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