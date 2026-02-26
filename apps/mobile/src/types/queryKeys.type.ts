import { ViewStyle, TextStyle } from "react-native";

export const QueryKeys = {
    OPEN_TRADES: 'openTrades',
    CLOSE_TRADES: 'closeTrades',
    USER_BALANCE: 'balance',
} as const;

export interface ActionButtonsProps {
    onBuyPress?: () => void;
    onSellPress?: () => void;
};

export interface OrderBottomSheetStyles {
    sheetBackground: ViewStyle;
    handleIndicator: ViewStyle;
    contentContainer: ViewStyle;
    kbContainer: ViewStyle;
    sheetHeader: ViewStyle;
    toggleRow: ViewStyle;
    sideChip: ViewStyle;
    fieldGroup: ViewStyle;
    input: TextStyle;
    inlineRow: ViewStyle;
    inlineField: ViewStyle;
    submitButton: ViewStyle;
    submitBuy: ViewStyle;
    submitSell: ViewStyle;
    submitContent: ViewStyle;
    submitLabel: TextStyle;
    submitLabelBuy: TextStyle;
    submitLabelSell: TextStyle;
};

