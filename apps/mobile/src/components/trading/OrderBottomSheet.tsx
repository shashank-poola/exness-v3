import React, { forwardRef, useCallback, useImperativeHandle, useMemo, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  View,
  Pressable,
  ViewStyle,
  TextStyle,
} from "react-native";
import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import Octicons from "@expo/vector-icons/Octicons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import ThemedText from "@/src/components/common/ThemedText";
import { ThemeColor } from "@/src/constants/theme";
import { SYMBOL_TO_PAIR, type SupportedSymbol } from "@/src/constants/markets";
import { useCreateTrade } from "@/src/hooks/useTrade";
import { TradeSide, type OrderRequest } from "@/src/types/order.type";
import LeverageSlider from "./LeverageSlider";

type Side = "BUY" | "SELL";

export type OrderBottomSheetRef = {
  open: (side: Side) => void;
};

type OrderBottomSheetProps = {
  symbol: SupportedSymbol;
  currentPrice?: number;
};

const LEVERAGE_PRESETS = [1, 5, 10, 50, 100];

const SYMBOL_TO_ASSET: Record<SupportedSymbol, string> = {
  BTC: "BTC_USDC",
  ETH: "ETH_USDC",
  SOL: "SOL_USDC",
};

const getSideChipActiveStyle = (isBuy: boolean): ViewStyle => ({
  backgroundColor: isBuy ? "#16A34A" : "#DC2626",
  borderColor: "transparent",
});

const OrderBottomSheet = forwardRef<OrderBottomSheetRef, OrderBottomSheetProps>(
  ({ symbol, currentPrice }, ref) => {
    const bottomSheetRef = useRef<BottomSheetModal>(null);
    const snapPoints = useMemo(() => ["90%", "90%"], []);

    const [side, setSide] = useState<Side>("BUY");
    const [quantity, setQuantity] = useState("1");
    const [leverage, setLeverage] = useState<number>(1);
    const [slippage, setSlippage] = useState("1");
    const [stopLoss, setStopLoss] = useState("");

    const { mutateAsync: createOrder, isPending } = useCreateTrade();

    useImperativeHandle(
      ref,
      () => ({
        open: (nextSide: Side) => {
          setSide(nextSide);
          bottomSheetRef.current?.present();
        },
      }),
      []
    );

    const handleSubmit = useCallback(async () => {
      const qty = Number(quantity || 0);
      const slip = Number(slippage || 0);
      const sl = stopLoss ? Number(stopLoss) : undefined;

      if (!currentPrice || !qty || !slip) {
        return;
      }

      const payload: OrderRequest = {
        asset: SYMBOL_TO_ASSET[symbol],
        side: side === "BUY" ? TradeSide.BUY : TradeSide.SELL,
        quantity: qty,
        leverage,
        slippage: slip,
        tradeOpeningPrice: currentPrice,
        stopLoss: sl,
      };

      try {
        await createOrder(payload);
        bottomSheetRef.current?.dismiss();
      } catch {
        // errors surfaced via toasts or dev console
      }
    }, [
      quantity,
      slippage,
      stopLoss,
      currentPrice,
      symbol,
      side,
      leverage,
      createOrder,
    ]);

    return (
      <BottomSheetModal
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        backgroundStyle={styles.sheetBackground}
        handleIndicatorStyle={styles.handleIndicator}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
      >
        <BottomSheetView style={styles.contentContainer}>
          <KeyboardAvoidingView
            style={styles.kbContainer}
            behavior="padding"
            keyboardVerticalOffset={Platform.OS === "ios" ? 16 : 0}
          >
            <View style={styles.sheetHeader}>
              <ThemedText size="lg" variant="primary">
                Open Position - {SYMBOL_TO_PAIR[symbol]}
              </ThemedText>
            </View>

            <View style={styles.toggleRow}>
              {(["BUY", "SELL"] as Side[]).map((s) => {
                const active = side === s;
                return (
                  <Pressable
                    key={s}
                    style={[styles.sideChip, active && getSideChipActiveStyle(s === "BUY")]}
                    onPress={() => setSide(s)}
                  >
                    <ThemedText
                      size="sm"
                      variant={active ? "primary" : "secondary"}
                    >
                      {s === "BUY" ? "LONG" : "SHORT"}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.fieldGroup}>
              <ThemedText size="sm" variant="secondary">
                Quantity
              </ThemedText>
              <TextInput
                value={quantity}
                onChangeText={(val) => {
                  setQuantity(val);
                  bottomSheetRef.current?.snapToIndex(1);
                }}
                onFocus={() => bottomSheetRef.current?.snapToIndex(1)}
                keyboardType="numeric"
                style={styles.input}
                placeholder="1.00"
                placeholderTextColor={ThemeColor.text.tertiary}
              />
              <ThemedText size="xs" variant="tertiary">
                Range: 0.01 - 100.00
              </ThemedText>
            </View>

            <View style={styles.fieldGroup}>
              <LeverageSlider value={leverage} onChange={setLeverage} />
            </View>

            <View style={[styles.fieldGroup, styles.inlineRow]}>
              <View style={styles.inlineField}>
                <ThemedText size="sm" variant="secondary">
                  Slippage (%)
                </ThemedText>
                <TextInput
                  value={slippage}
                  onChangeText={(val) => {
                    setSlippage(val);
                    bottomSheetRef.current?.snapToIndex(1);
                  }}
                  onFocus={() => bottomSheetRef.current?.snapToIndex(1)}
                  keyboardType="numeric"
                  style={styles.input}
                  placeholder="1"
                  placeholderTextColor={ThemeColor.text.tertiary}
                />
              </View>

              <View style={styles.inlineField}>
                <ThemedText size="sm" variant="secondary">
                  Stop Loss (Optional)
                </ThemedText>
                <TextInput
                  value={stopLoss}
                  onChangeText={(val) => {
                    setStopLoss(val);
                    bottomSheetRef.current?.snapToIndex(1);
                  }}
                  onFocus={() => bottomSheetRef.current?.snapToIndex(1)}
                  keyboardType="numeric"
                  style={styles.input}
                  placeholder="Not set"
                  placeholderTextColor={ThemeColor.text.tertiary}
                />
              </View>
            </View>

            <Pressable
              style={[
                styles.submitButton,
                side === "BUY" ? styles.submitBuy : styles.submitSell,
                isPending && { opacity: 0.7 },
              ]}
              disabled={isPending}
              onPress={handleSubmit}
            >
              <View style={styles.submitContent}>
                {side === "BUY" ? (
                  <Octicons name="feed-plus" size={20} color="#000000" />
                ) : (
                  <FontAwesome5 name="money-bill-wave" size={20} color="#000000" />
                )}
                <ThemedText
                  size="md"
                  style={[
                    styles.submitLabel,
                    side === "BUY" ? styles.submitLabelBuy : styles.submitLabelSell,
                  ]}
                >
                  {isPending
                    ? "Placing..."
                    : side === "BUY"
                    ? "LONG / BUY"
                    : "SHORT / SELL"}
                </ThemedText>
              </View>
            </Pressable>
          </KeyboardAvoidingView>
        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);

interface OrderBottomSheetStyles {
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
}

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: "#050509",
  },
  handleIndicator: {
    backgroundColor: "#27272A",
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  kbContainer: {
    flex: 1,
    gap: 14,
  },
  sheetHeader: {
    marginBottom: 4,
  },
  toggleRow: {
    flexDirection: "row",
    gap: 8,
  },
  sideChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#27272A",
    alignItems: "center",
  },
  fieldGroup: {
    gap: 6,
  },
  input: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#27272A",
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: ThemeColor.text.primary,
    fontSize: 14,
  },
  inlineRow: {
    flexDirection: "row",
    gap: 12,
  },
  inlineField: {
    flex: 1,
  },
  submitButton: {
    marginTop: 8,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  submitBuy: {
    borderWidth: 1,
    borderColor: "#FFFFFF",
  },
  submitSell: {
    borderWidth: 1,
    borderColor: "#FFFFFF",
  },
  submitContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  submitLabel: {
    color: "#000000",
  },
  submitLabelBuy: {
    color: "#000000",
  },
  submitLabelSell: {
    color: "#000000",
  },
}) as OrderBottomSheetStyles;

export default OrderBottomSheet;

