import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Feather from "@expo/vector-icons/Feather";

import CardContainer from "@/src/components/common/CardContainer";
import ThemedText from "@/src/components/common/ThemedText";
import { ThemeColor } from "@/src/constants/theme";
import { useOpenTrades } from "@/src/hooks/useTrade";
import { useMarketPrices } from "@/src/hooks/useMarketPrices";
import type { OpenOrder } from "@/src/types/order.type";
import type { SupportedSymbol } from "@/src/constants/markets";

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

const HomePortfolioCard: React.FC = () => {
  const [showValues, setShowValues] = useState(true);
  const { data: openOrders } = useOpenTrades();
  const prices = useMarketPrices();

  const { totalEquity, totalPnl, totalPnlPercent, hasPositions } = useMemo(() => {
    if (!openOrders) {
      return {
        totalMargin: 0,
        totalPnl: 0,
        totalEquity: 0,
        totalPnlPercent: 0,
        hasPositions: false,
      };
    }

    const enriched = (openOrders as OpenOrder[]).map((order) => {
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

    const totalMargin = enriched.reduce((sum, p) => sum + p.margin, 0);
    const totalPnl = enriched.reduce((sum, p) => sum + (p.pnl ?? 0), 0);
    const totalEquity = totalMargin + totalPnl;
    const totalPnlPercent = totalMargin > 0 ? (totalPnl / totalMargin) * 100 : 0;

    return {
      totalMargin,
      totalPnl,
      totalEquity,
      totalPnlPercent,
      hasPositions: enriched.length > 0,
    };
  }, [openOrders, prices]);

  return (
    <CardContainer style={styles.card}>
      <View style={styles.row}>
        <View>
          <ThemedText size="sm" variant="secondary">
            Portfolio
          </ThemedText>
          <ThemedText size="xl" variant="primary" style={styles.balance}>
            {showValues ? `$${hasPositions ? totalEquity.toFixed(2) : "0.00"}` : "••••••"}
          </ThemedText>
          <ThemedText
            size="sm"
            style={[
              styles.change,
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
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginTop: 12,
    paddingVertical: 18,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  balance: {
    marginTop: 4,
  },
  change: {
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
});

export default HomePortfolioCard;

