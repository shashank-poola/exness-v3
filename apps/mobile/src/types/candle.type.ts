export interface Candlestick {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
}

export interface CandlesticksResponse {
    candlesticks: Candlestick[];
}