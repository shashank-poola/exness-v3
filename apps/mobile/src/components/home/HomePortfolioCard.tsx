import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Feather from "@expo/vector-icons/Feather";

import CardContainer from "@/src/components/common/CardContainer";
import ThemedText from "@/src/components/common/ThemedText";
import { ThemeColor } from "@/src/constants/theme";
import { useOpenTrades } from "@/src/hooks/useTrade";
import { useMarketPrices } from "@/src/hooks/useMarketPrices";
import { useUserBalance } from "@/src/hooks/useUserBalance";
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
  const { data: balance } = useUserBalance();

  const { cashBalance } = useMemo(() => {
    const numericBalance = typeof balance === "number" ? balance : 0;

    if (!openOrders) {
      return {
        cashBalance: numericBalance,
        totalPnl: 0,
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

      const pnlPercent = order.margin > 0 && pnl != null ? (pnl / order.margin) * 100 : 0;
      const symbol = ASSET_TO_SYMBOL[order.asset] ?? "BTC";

      return {
        ...order,
        symbol,
        pnl,
        pnlPercent,
      };
    });

    const totalMargin = enriched.reduce((sum, p) => sum + p.margin, 0);
    const totalPnl = enriched.reduce((sum, p) => sum + (p.pnl ?? 0), 0);
    const totalPnlPercent = totalMargin > 0 ? (totalPnl / totalMargin) * 100 : 0;

    return {
      cashBalance: numericBalance,
      totalPnl,
      totalPnlPercent,
      hasPositions: enriched.length > 0,
    };
  }, [openOrders, prices, balance]);

  return (
    <CardContainer style={styles.card}>
      <View style={styles.row}>
        <View>
          <ThemedText size="md" variant="primary">
            Account
          </ThemedText>
          <ThemedText size="xl" variant="primary" style={styles.balance}>
            {showValues
              ? `$${cashBalance.toFixed(2)}`
              : "••••••"}
          </ThemedText>
          <ThemedText size="xs" variant="secondary">
            TradeX as USD
          </ThemedText>
          <View style={styles.actionRow}>
            <Pressable style={[styles.actionButton, styles.actionButtonPrimary]}>
              <Feather name="plus" size={22} color="#000000" />
            </Pressable>
            <Pressable style={[styles.actionButton, styles.actionButtonSecondary]}>
              <Feather name="arrow-down" size={22} color="#FFFFFF" />
            </Pressable>
            <Pressable style={[styles.actionButton, styles.actionButtonTertiary]}>
              <Feather name="arrow-up" size={22} color="#E4E4E7" />
            </Pressable>
          </View>
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
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  actionButton: {
    borderRadius: 999,
    width: 95,
    paddingVertical: 10,
    paddingHorizontal: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtonPrimary: {
    backgroundColor: "#FFFFFF",
  },
  actionButtonSecondary: {
    backgroundColor: "#3F3F46",
  },
  actionButtonTertiary: {
    backgroundColor: "#18181B",
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

