import { ImageSourcePropType } from "react-native";
import { Side } from "./candle.type";
import { type SupportedSymbol } from "../constants/markets";

export interface MarketHeaderProps {
    baseSymbol: string;
    pair: string;
    price?: number;
    changePercent?: number;
    iconSource?: ImageSourcePropType;
}

export type OrderBottomSheetRef = {
    open: (side: Side) => void;
  };
  
export type OrderBottomSheetProps = {
    symbol: SupportedSymbol;
    currentPrice?: number;
};