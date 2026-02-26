import React, { useMemo } from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
import CardContainer from "@/src/components/CardContainer";
import ThemedText from "@/src/components/common/ThemedText";
import { ThemeColor } from "@/src/constants/theme";
import { SYMBOL_ICON_MAP, type SupportedSymbol } from "@/src/constants/markets";
import { useMarketPrices } from "@/src/hooks/useMarketPrices";
import { useCloseTrade, useOpenTrades } from "@/src/hooks/useTrade";
import type { OpenOrder } from "@/src/types/order.type";
import { ASSET_TO_SYMBOL, ASSET_TO_WS_SYMBOL } from "@/src/constants/markets";

const PositionsSection: React.FC = () => {
  const { data: openOrders, isLoading } = useOpenTrades();
  const prices = useMarketPrices();
  const closeTrade = useCloseTrade();

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

      const equity = order.margin + (pnl ?? 0);
      const pnlPercent = order.margin > 0 && pnl != null ? (pnl / order.margin) * 100 : 0;
      const mappedSymbol = ASSET_TO_SYMBOL[order.asset] ?? "BTC";

      return {
        ...order,
        symbol: mappedSymbol,
        currentPrice,
        pnl,
        pnlPercent,
        equity,
      };
    });
  }, [openOrders, prices]);

  const handleClose = (id: string) => {
    closeTrade.mutate(id);
  };

  return (
    <View style={styles.wrapper}>
      <ThemedText size="xl" variant="primary" style={styles.title}>
        Positions
      </ThemedText>

      {isLoading ? (
        <ThemedText size="sm" variant="secondary">
          Loading positions...
        </ThemedText>
      ) : enriched.length === 0 ? (
        <ThemedText size="sm" variant="secondary">
          No open positions yet.
        </ThemedText>
      ) : (
        enriched.map((position) => {
          const iconSource = SYMBOL_ICON_MAP[position.symbol as SupportedSymbol];
          const isLong = position.side === "LONG";
          const pnl = position.pnl ?? 0;
          const pnlPositive = pnl >= 0;
          const pnlPercent = position.pnlPercent ?? 0;
          const currentPrice = position.currentPrice;
          const notional =
            currentPrice != null && isFinite(currentPrice)
              ? currentPrice * position.quantity
              : undefined;

          return (
            <CardContainer key={position.id} style={styles.card}>
              <View style={styles.headerRow}>
                <View style={styles.assetRow}>
                  <Image source={iconSource} style={styles.assetIcon} />
                  <ThemedText size="xl" variant="primary">
                    {position.symbol}USD
                  </ThemedText>
                </View>
                <View
                  style={[
                    styles.sidePill,
                    isLong ? styles.sidePillLong : styles.sidePillShort,
                  ]}
                >
                  <ThemedText size="sm" style={styles.sidePillText}>
                    {isLong ? "LONG" : "SHORT"} | {position.leverage.toFixed(2)}x
                  </ThemedText>
                </View>
              </View>

              <View style={styles.mainRow}>
                <View style={styles.column}>
                  <ThemedText size="lg" variant="secondary">
                    Size
                  </ThemedText>
                  <ThemedText size="xl" variant="primary" style={styles.emphasis}>
                    {position.quantity.toLocaleString()}
                  </ThemedText>
                  <ThemedText size="xl" variant="secondary">
                    {notional != null ? `$${notional.toFixed(2)}` : "--"}
                  </ThemedText>
                </View>

                <View style={styles.columnRight}>
                  <ThemedText size="xl" variant="secondary">
                    P&amp;L
                  </ThemedText>
                  <ThemedText
                    size="lg"
                    style={[
                      styles.emphasis,
                      pnlPositive ? styles.positive : styles.negative,
                    ]}
                  >
                    {`${pnlPositive ? "" : "-"}$${Math.abs(pnl).toFixed(2)}`}
                  </ThemedText>
                  <ThemedText
                    size="md"
                    style={pnlPositive ? styles.positive : styles.negative}
                  >
                    {`${pnlPositive ? "" : "-"}${Math.abs(pnlPercent).toFixed(2)}%`}
                  </ThemedText>
                </View>
              </View>

              <View style={styles.details}>
                <View style={styles.detailRow}>
                  <ThemedText size="md" variant="secondary">
                    Avg. Entry Price
                  </ThemedText>
                  <ThemedText size="md" variant="primary">
                    {position.tradeOpeningPrice.toFixed(6)}
                  </ThemedText>
                </View>
                <View style={styles.detailRow}>
                  <ThemedText size="md" variant="secondary">
                    Margin
                  </ThemedText>
                  <ThemedText size="md" variant="primary">
                    ${position.margin.toFixed(2)}
                  </ThemedText>
                </View>
                <View style={styles.detailRow}>
                  <ThemedText size="md" variant="secondary">
                    Leverage
                  </ThemedText>
                  <ThemedText size="md" variant="primary">
                    {position.leverage.toFixed(2)}x
                  </ThemedText>
                </View>
                <View style={styles.detailRow}>
                  <ThemedText size="md" variant="secondary">
                    Slippage
                  </ThemedText>
                  <ThemedText size="md" variant="primary">
                    {(position.slippage * 100).toFixed(2)}%
                  </ThemedText>
                </View>
                <View style={styles.detailRow}>
                </View>
              </View>

              <Pressable
                style={styles.closeButton}
                onPress={() => handleClose(position.id)}
                disabled={closeTrade.isPending}
              >
                <ThemedText size="button" style={styles.closeButtonLabel}>
                  {closeTrade.isPending ? "Closing..." : "Close Position"}
                </ThemedText>
              </Pressable>
            </CardContainer>
          );
        })
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 24,
    marginBottom: 32,
    gap: 12,
  },
  title: {
    marginBottom: 4,
  },
  card: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: "#09090B",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  assetRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  assetIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  sidePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  sidePillLong: {
    backgroundColor: "rgba(34,197,94,0.16)",
  },
  sidePillShort: {
    backgroundColor: "rgba(248,113,113,0.16)",
  },
  sidePillText: {
    color: ThemeColor.text.primary,
    fontWeight: "600",
  },
  mainRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  column: {
    flex: 1,
    gap: 2,
  },
  columnRight: {
    flex: 1,
    alignItems: "flex-end",
    gap: 2,
  },
  emphasis: {
    fontFamily: "Sora-SemiBold",
  },
  positive: {
    color: ThemeColor.status.success,
  },
  negative: {
    color: ThemeColor.status.error,
  },
  details: {
    marginTop: 4,
    marginBottom: 16,
    gap: 4,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  closeButton: {
    marginTop: 4,
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#18181B",
  },
  closeButtonLabel: {
    color: ThemeColor.text.primary,
    fontWeight: "600",
  },
});

export default PositionsSection;

