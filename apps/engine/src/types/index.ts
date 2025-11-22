interface Balance {
    amount: number;
    currency: string;
  }
  
  export interface Trade {
    id: string;
    openPrice: number;
    closePrice?: number;
  
    quantity: number;
    leverage: number;
    margin: number;
    status?: 'OPEN' | 'CLOSED';
  
    stopLoss?: number;
    takeProfit?: number;
    tradeOpeningPrice: number;
    slippage: number;
  
    side: string;
    asset: AssetSymbols;
  
    pnl?: number;
    createdAt: Date;
    closedAt?: Date;
  }
  
  export interface User {
    id: string;
    email: string;
    balance: Balance;
    trades: Trade[];
  }
  
  export enum AssetSymbols {
    SOL = 'SOL_USDC_PERP',
    ETH = 'ETH_USDC_PERP',
    BTC = 'BTC_USDC_PERP',
  }
  
  export type PriceObj = Partial<{
    [key in AssetSymbols]: AsksBids;
  }>;
  
  export interface AsksBids {
    buyPrice: number;
    sellPrice: number;
    decimal: number;
  }
  
  export type PriceStore = Partial<Record<AssetSymbols, AsksBids>>; 
  export type UserStore = Record<string, User>;