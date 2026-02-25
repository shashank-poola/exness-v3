import React, { useMemo, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Feather from "@expo/vector-icons/Feather";

import ScreenHeader from "@/src/components/common/ScreenHeader";
import ThemedText from "@/src/components/common/ThemedText";
import { ThemeColor } from "@/src/constants/theme";
import CardContainer from "@/src/components/common/CardContainer";
import { useOpenTrades } from "@/src/hooks/useTrade";
import { useMarketPrices } from "@/src/hooks/useMarketPrices";
import { useUserBalance } from "@/src/hooks/useUserBalance";
import type { OpenOrder } from "@/src/types/order.type";
import { SYMBOL_ICON_MAP, type SupportedSymbol } from "@/src/constants/markets";

const ASSET_TO_SYMBOL: Record<string, SupportedSymbol> = {
  BTC_USDC: "BTC",
  ETH_USDC: "ETH",
  SOL_USDC: "SOL",
};

const ASSET_TO_WS_SYMBOL: Record<string, string> = {
  BTC_USDC: "BTCUSDT",
  ETH_USDC: "ETHUSDT",
  SOL_USDC: "SOLUSDT",
};

export default function PortfolioScreen() {
  const router = useRouter();
  const [showValues, setShowValues] = useState(true);
  const { data: openOrders, isLoading } = useOpenTrades();
  const prices = useMarketPrices();
  const { data: balance } = useUserBalance();

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
      const symbol = ASSET_TO_SYMBOL[order.asset] ?? "BTC";

      return {
        ...order,
        symbol,
        currentPrice,
        pnl,
        pnlPercent,
        equity,
      };
    });
  }, [openOrders, prices]);

  const totalMargin = enriched.reduce((sum, p) => sum + p.margin, 0);
  const totalPnl = enriched.reduce((sum, p) => sum + (p.pnl ?? 0), 0);
  const totalEquity = totalMargin + totalPnl;
  const totalPnlPercent = totalMargin > 0 ? (totalPnl / totalMargin) * 100 : 0;
  const hasPositions = enriched.length > 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom", "left", "right"]}>
      <ScreenHeader
        onBackPress={() => router.push("/(tabs)/home")}
        onSearchPress={() => router.push("/(tabs)/markets/search")}
      />

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <CardContainer style={styles.portfolioCard}>
          <View style={styles.portfolioHeaderRow}>
            <View>
              <ThemedText size="sm" variant="secondary">
                Portfolio
              </ThemedText>
              <ThemedText size="xl" variant="primary" style={styles.portfolioBalance}>
                {showValues
                  ? `$${typeof balance === "number" ? balance.toFixed(2) : "0.00"}`
                  : "••••••"}
              </ThemedText>
              <ThemedText
                size="sm"
                style={[
                  styles.portfolioChange,
                  totalPnl >= 0 ? styles.positive : styles.negative,
                ]}
              >
                {hasPositions
                  ? `${totalPnl >= 0 ? "+" : ""}${totalPnlPercent.toFixed(
                      2
                    )}% (${totalPnl >= 0 ? "+" : "-"}$${Math.abs(totalPnl).toFixed(2)})`
                  : "No open positions"}
              </ThemedText>
            </View>

            <Pressable
              style={styles.eyeButton}
              onPress={() => setShowValues((prev) => !prev)}
            >
              <Feather
                name={showValues ? "eye" : "eye-off"}
                size={18}
                color={ThemeColor.text.secondary}
              />
            </Pressable>
          </View>
        </CardContainer>

        <View style={styles.sectionHeader}>
          <ThemedText size="lg" variant="primary">
            Holdings
          </ThemedText>
        </View>

        <CardContainer>
          {isLoading ? (
            <ThemedText size="sm" variant="secondary">
              Loading holdings...
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
                <View style={styles.positionRow} key={position.id}>
                  <View style={styles.positionLeft}>
                    <Image source={iconSource} style={styles.assetIcon} />
                    <View style={styles.positionTitleBlock}>
                      <ThemedText size="sm" variant="primary">
                        {symbol}
                      </ThemedText>
                      <ThemedText size="xs" variant="secondary">
                        {isLong ? "Long" : "Short"} • {position.leverage}x
                      </ThemedText>
                    </View>
                  </View>

                  <View style={styles.positionRight}>
                    <ThemedText size="sm" variant="secondary">
                      Entry {position.tradeOpeningPrice.toFixed(2)}
                    </ThemedText>
                    <ThemedText size="xs" variant="secondary">
                      Current{" "}
                      {position.currentPrice != null
                        ? position.currentPrice.toFixed(2)
                        : "--"}
                    </ThemedText>
                    <ThemedText size="xs" variant="secondary">
                      Margin ${position.margin.toFixed(2)}
                    </ThemedText>
                    <ThemedText
                      size="sm"
                      style={[styles.pnlText, pnlPositive ? styles.positive : styles.negative]}
                    >
                      {showValues
                        ? `${pnlPositive ? "+" : "-"}$${Math.abs(pnl).toFixed(2)}`
                        : "•••••"}
                    </ThemedText>
                  </View>
                </View>
              );
            })
          )}
        </CardContainer>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: ThemeColor.background.app,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 16,
  },
  portfolioCard: {
    paddingVertical: 18,
  },
  portfolioHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  portfolioBalance: {
    marginTop: 4,
  },
  portfolioChange: {
    marginTop: 4,
  },
  positive: {
    color: ThemeColor.status.success,
  },
  negative: {
    color: ThemeColor.status.error,
  },
  eyeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#18181B",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  positionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#27272A",
  },
  positionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  assetIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  positionTitleBlock: {
    gap: 2,
  },
  positionRight: {
    alignItems: "flex-end",
    gap: 2,
  },
  pnlText: {
    fontWeight: "600",
  },
});
