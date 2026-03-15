import React, { useMemo } from "react";
import { Image, ImageStyle, StyleSheet, View, ViewStyle, TextStyle } from "react-native";
import CardContainer from "./CardContainer";
import ThemedText from "./common/ThemedText";
import { ThemeColor } from "@/src/constants/theme";
import { useOpenTrades } from "@/src/hooks/useTrade";
import { useMarketPrices } from "@/src/hooks/useMarketPrices";
import { SYMBOL_ICON_MAP, type SupportedSymbol } from "@/src/constants/markets";
import type { OpenOrder } from "@/src/types/order.type";
import { ASSET_TO_SYMBOL, ASSET_TO_WS_SYMBOL } from "@/src/constants/markets";

interface HoldingsSectionProps {
  symbol: SupportedSymbol;
}

const getSidePillStyle = (isBuy: boolean): ViewStyle => ({
  paddingHorizontal: 10,
  paddingVertical: 4,
  borderRadius: 999,
  backgroundColor: isBuy ? "rgba(34,197,94,0.15)" : "rgba(248,113,113,0.15)",
});

const HoldingsSection: React.FC<HoldingsSectionProps> = ({ symbol }) => {
  const { data: openOrders, isLoading } = useOpenTrades();
  const prices = useMarketPrices();

  const positions = useMemo(
    () =>
      (Array.isArray(openOrders) ? openOrders : [])
        .filter((order: OpenOrder) => {
          const mapped = ASSET_TO_SYMBOL[order.asset];
          return mapped === symbol;
        })
        .map((order: OpenOrder) => {
          const wsSymbol = ASSET_TO_WS_SYMBOL[order.asset] ?? "";
          const priceEntry = wsSymbol ? prices[wsSymbol] : undefined;
          const currentPrice = priceEntry ? priceEntry.ask || priceEntry.bid || 0 : undefined;
          const entryPrice = order.tradeOpeningPrice ?? order.openPrice;
          let pnl: number | undefined;
          if (currentPrice != null && isFinite(currentPrice)) {
            if (order.side === "LONG") {
              pnl = (currentPrice - entryPrice) * order.quantity * order.leverage;
            } else if (order.side === "SHORT") {
              pnl = (entryPrice - currentPrice) * order.quantity * order.leverage;
            }
          }
          return { ...order, livePnl: pnl ?? 0, hasLivePrice: currentPrice != null && isFinite(currentPrice) };
        }),
    [openOrders, symbol, prices]
  );

  return (
    <View style={styles.wrapper}>
      <ThemedText size="xl" variant="primary" style={styles.title}>
        Holdings
      </ThemedText>

      <CardContainer>
        {isLoading ? (
          <View>
            <ThemedText variant="secondary" size="sm">
              Loading positions...
            </ThemedText>
          </View>
        ) : positions.length === 0 ? (
          <View>
            <ThemedText variant="secondary" size="sm">
              No holdings yet
            </ThemedText>
            <ThemedText variant="primary" size="sm" style={styles.placeholder}>
              Start by opening a Buy or Sell position.
            </ThemedText>
          </View>
        ) : (
          <View style={styles.positionContainer}>
            {positions.map((position) => {
              const mappedSymbol = ASSET_TO_SYMBOL[position.asset] ?? symbol;
              const iconSource = SYMBOL_ICON_MAP[mappedSymbol];
              const isLong = position.side === "LONG";
              const extended = position as OpenOrder & { livePnl: number; hasLivePrice?: boolean };
              const livePnl = extended.livePnl;
              const hasLivePrice = extended.hasLivePrice ?? false;
              const pnlPositive = livePnl >= 0;

              return (
                <View style={styles.positionRow} key={position.id}>
                  <View style={styles.positionLeft}>
                    <Image source={iconSource} style={styles.assetIcon} />
                    <View>
                      <View style={getSidePillStyle(isLong)}>
                        <ThemedText size="xs" style={styles.sidePillText}>
                          {isLong ? "Long" : "Short"} {mappedSymbol}
                        </ThemedText>
                      </View>
                      <ThemedText size="xs" variant="secondary" style={styles.subLabel}>
                        Qty {position.quantity.toFixed(3)} • {position.leverage}x
                      </ThemedText>
                    </View>
                  </View>

                  <View style={styles.positionRight}>
                    <ThemedText size="xs" variant="secondary">
                      Entry
                    </ThemedText>
                    <ThemedText size="sm" variant="primary">
                      {position.tradeOpeningPrice.toFixed(2)}
                    </ThemedText>
                    <ThemedText size="xs" variant="secondary" style={styles.pnlLabel}>
                      Live PnL
                    </ThemedText>
                    <ThemedText
                      size="sm"
                      style={hasLivePrice ? (pnlPositive ? styles.positive : styles.negative) : undefined}
                    >
                      {hasLivePrice ? `${pnlPositive ? "" : "-"}$${Math.abs(livePnl).toFixed(2)}` : "--"}
                    </ThemedText>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </CardContainer>
    </View>
  );
};

interface HoldingsStyles {
  wrapper: ViewStyle;
  title: TextStyle;
  placeholder: TextStyle;
  positionContainer: ViewStyle;
  sidePillText: TextStyle;
  positionRow: ViewStyle;
  positionLeft: ViewStyle;
  assetIcon: ImageStyle;
  subLabel: TextStyle;
  positionRight: ViewStyle;
  pnlLabel: TextStyle;
  positive: TextStyle;
  negative: TextStyle;
  row: ViewStyle;
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 32,
  },
  title: {
    marginBottom: 12,
  },
  placeholder: {
    marginTop: 8,
  },
  positionContainer: {
    gap: 10,
  },
  sidePillText: {
    color: ThemeColor.text.primary,
  },
  positionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#27272A",
  },
  positionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  assetIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  subLabel: {
    marginTop: 4,
  },
  positionRight: {
    alignItems: "flex-end",
    gap: 2,
  },
  pnlLabel: {
    marginTop: 6,
  },
  positive: {
    color: ThemeColor.status.success,
  },
  negative: {
    color: ThemeColor.status.error,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
}) as HoldingsStyles;

export default HoldingsSection;

