export enum TradeSide {
    BUY,
    SELL
}

export enum AssetSymbol {
    BTC_USDC_PERP = "BTC",
    ETH_USDC_PERP = "ETH",
    SOL_USDC_PERP = "SOL",
}

export interface OrderRequest {
    asset: string;
    side: TradeSide;
    quantity: number;
    leverage?: number;
    slippage: number;
    tradeOpeningPrice: number;
    takeProfit?: number;
    stopLoss?: number;
}

export interface OpenOrder {
    id: string;
    asset: string;
    side: string;
    quantity: number;
    leverage: number;
    margin: number;
    status?: 'OPEN';
    openPrice: number;
    tradeOpeningPrice: number;
    slippage: number;
    stopLoss?: number;
    takeProfit?: number;
}

export interface ClosedOrder {
    id: string;
    openPrice: number;
    closePrice: number;
    leverage: number;
    pnl: number;
    slippage: number;
    quantity: number;
    side: string;
    asset: string;
    liquidated: boolean;
    userId: string;
    reason?: string;
}

export interface CreateOrderResponse {
    message: string;
    trade: OpenOrder;
}

export interface CloseOrderResponse {
    message: string;
}