import React, { useMemo } from "react";
import { Image, StyleSheet, View } from "react-native";
import CardContainer from "@/src/components/CardContainer";
import ThemedText from "@/src/components/common/ThemedText";
import { ThemeColor } from "@/src/constants/theme";
import { SYMBOL_ICON_MAP, type SupportedSymbol } from "@/src/constants/markets";
import { useMarketPrices } from "@/src/hooks/useMarketPrices";
import { useOpenTrades } from "@/src/hooks/useTrade";
import type { OpenOrder } from "@/src/types/order.type";
import { ASSET_TO_SYMBOL, ASSET_TO_WS_SYMBOL } from "@/src/constants/markets";

const HomePositionsSection: React.FC = () => {
  const { data: openOrders, isLoading } = useOpenTrades();
  const prices = useMarketPrices();

  const enriched = useMemo(() => {
    if (!openOrders) return [];

    return (openOrders as OpenOrder[]).map((order) => {
      const wsSymbol = ASSET_TO_WS_SYMBOL[order.asset] ?? "";
      const priceEntry = wsSymbol ? prices[wsSymbol] : undefined;
      const currentPrice = priceEntry ? priceEntry.ask || priceEntry.bid || 0 : undefined;
      const side = order.side;

      let pnl: number | undefined;
      if (currentPrice != null && isFinite(currentPrice)) {
        if (side === "LONG") {
          pnl = (currentPrice - order.openPrice) * order.quantity * order.leverage;
        } else if (side === "SHORT") {
          pnl = (order.openPrice - currentPrice) * order.quantity * order.leverage;
        }
      }

      const symbol = ASSET_TO_SYMBOL[order.asset] ?? "BTC";

      return {
        ...order,
        symbol,
        pnl,
      };
    });
  }, [openOrders, prices]);

  const hasPositions = enriched.length > 0;

  return (
    <View style={styles.wrapper}>
      <CardContainer style={styles.card}>
        <View style={styles.headerRow}>
          <ThemedText size="xl" variant="primary">
            Positions
          </ThemedText>
          <ThemedText size="md" variant="secondary">
            {hasPositions ? `${enriched.length} Orders` : "No Orders"}
          </ThemedText>
        </View>

        {isLoading ? (
          <ThemedText size="sm" variant="secondary">
            Loading positions...
          </ThemedText>
        ) : !hasPositions ? (
          <ThemedText size="sm" variant="secondary">
            You do not have any open positions yet.
          </ThemedText>
        ) : (
          enriched.map((position) => {
            const symbol = position.symbol as SupportedSymbol;
            const iconSource = SYMBOL_ICON_MAP[symbol];
            const isLong = position.side === "LONG";
            const pnl = position.pnl ?? 0;
            const pnlPositive = pnl >= 0;

            return (
              <View key={position.id} style={styles.positionRow}>
                <View style={styles.left}>
                  <Image source={iconSource} style={styles.assetIcon} />
                  <View>
                    <ThemedText size="md" variant="primary">
                      {symbol}USD
                    </ThemedText>
                    <ThemedText size="xs" variant="secondary">
                      {isLong ? "LONG" : "SHORT"} | {position.leverage.toFixed(2)}x
                    </ThemedText>
                  </View>
                </View>
                <View style={styles.right}>
                  <ThemedText size="sm" variant="secondary">
                    P&L
                  </ThemedText>
                  <ThemedText
                    size="sm"
                    style={pnlPositive ? styles.positive : styles.negative}
                  >
                    {`${pnlPositive ? "" : "-"}$${Math.abs(pnl).toFixed(2)}`}
                  </ThemedText>
                </View>
              </View>
            );
          })
        )}
      </CardContainer>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  card: {
    paddingVertical: 14,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  positionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#27272A",
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  right: {
    alignItems: "flex-end",
  },
  assetIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  positive: {
    color: ThemeColor.status.success,
  },
  negative: {
    color: ThemeColor.status.error,
  },
});

export default HomePositionsSection;

