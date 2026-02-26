import React, { useMemo } from "react";
import { Image, StyleSheet, View } from "react-native";
import CardContainer from "@/src/components/CardContainer";
import ThemedText from "@/src/components/common/ThemedText";
import { ThemeColor } from "@/src/constants/theme";
import { SYMBOL_ICON_MAP, SYMBOL_TO_WS_SYMBOL, type SupportedSymbol } from "@/src/constants/markets";
import { useMarketPrices } from "@/src/hooks/useMarketPrices";
import { useCandlesticks } from "@/src/hooks/useCandlesticks";

const MARKET_SYMBOLS: SupportedSymbol[] = ["ETH", "BTC", "SOL"];

const SYMBOL_LABEL: Record<SupportedSymbol, string> = {
  BTC: "Bitcoin",
  ETH: "Ethereum",
  SOL: "Solana",
};

const HomeMarketsSection: React.FC = () => {
  const prices = useMarketPrices();

  const stats = useSymbolStats();

  return (
    <View style={styles.wrapper}>
      <CardContainer style={styles.card}>
        <View style={styles.headerRow}>
          <ThemedText size="xl" variant="primary">
            Markets
          </ThemedText>
        </View>

        {MARKET_SYMBOLS.map((symbol) => {
          const wsSymbol = SYMBOL_TO_WS_SYMBOL[symbol];
          const priceEntry = prices[wsSymbol];
          const wsPrice = priceEntry ? priceEntry.bid : undefined;
          const fallback = stats[symbol]?.lastClose;
          const price = wsPrice ?? fallback;
          const change = stats[symbol]?.changePercent;
          const isPositive = change != null && change >= 0;
          const changeColor = isPositive
            ? ThemeColor.status.success
            : ThemeColor.status.error;

          return (
            <View key={symbol} style={styles.row}>
              <View style={styles.left}>
                <Image source={SYMBOL_ICON_MAP[symbol]} style={styles.icon} />
                <View>
                  <ThemedText size="md" variant="primary">
                    {symbol}USD
                  </ThemedText>
                  <ThemedText size="sm" variant="secondary">
                    {SYMBOL_LABEL[symbol]}
                  </ThemedText>
                </View>
              </View>

              <View style={styles.right}>
                <ThemedText size="lg" variant="primary">
                  {formatPrice(price)}
                </ThemedText>
                {change != null && (
                  <ThemedText size="sm" style={[styles.changeText, { color: changeColor }]}>
                    {isPositive ? "▲" : "▼"} {Math.abs(change).toFixed(2)}%
                  </ThemedText>
                )}
              </View>
            </View>
          );
        })}
      </CardContainer>
    </View>
  );
};

function useSymbolStats(): Record<
  SupportedSymbol,
  { changePercent: number | undefined; lastClose: number | undefined }
> {
  const { data: ethData } = useCandlesticks(SYMBOL_TO_WS_SYMBOL.ETH, "1h");
  const ethLast = useMemo(() => {
    if (!ethData || !ethData.length) return undefined;
    return ethData[ethData.length - 1]?.close;
  }, [ethData]);
  const ethChange = useMemo(() => {
    if (!ethData || ethData.length < 2) return 0;
    const first = ethData[0];
    const last = ethData[ethData.length - 1];
    if (!first.open) return 0;
    return ((last.close - first.open) / first.open) * 100;
  }, [ethData]);

  const { data: btcData } = useCandlesticks(SYMBOL_TO_WS_SYMBOL.BTC, "1h");
  const btcLast = useMemo(() => {
    if (!btcData || !btcData.length) return undefined;
    return btcData[btcData.length - 1]?.close;
  }, [btcData]);
  const btcChange = useMemo(() => {
    if (!btcData || btcData.length < 2) return 0;
    const first = btcData[0];
    const last = btcData[btcData.length - 1];
    if (!first.open) return 0;
    return ((last.close - first.open) / first.open) * 100;
  }, [btcData]);

  const { data: solData } = useCandlesticks(SYMBOL_TO_WS_SYMBOL.SOL, "1h");
  const solLast = useMemo(() => {
    if (!solData || !solData.length) return undefined;
    return solData[solData.length - 1]?.close;
  }, [solData]);
  const solChange = useMemo(() => {
    if (!solData || solData.length < 2) return 0;
    const first = solData[0];
    const last = solData[solData.length - 1];
    if (!first.open) return 0;
    return ((last.close - first.open) / first.open) * 100;
  }, [solData]);

  return {
    ETH: { changePercent: ethChange, lastClose: ethLast },
    BTC: { changePercent: btcChange, lastClose: btcLast },
    SOL: { changePercent: solChange, lastClose: solLast },
  };
}

function formatPrice(price: number | undefined): string {
  if (price == null || !isFinite(price)) return "--";
  if (price >= 1000) {
    return price.toLocaleString(undefined, { maximumFractionDigits: 2 });
  }
  return price.toFixed(5);
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 16,
    paddingHorizontal: 16,
    marginBottom: 16,
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
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
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
  icon: {
    width: 26,
    height: 26,
    borderRadius: 12,
  },
  changeText: {
    marginTop: 2,
  },
});

export default HomeMarketsSection;

