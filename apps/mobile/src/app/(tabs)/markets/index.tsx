import React, { useMemo, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import ActionButtons from "@/src/components/trading/ActionButtons";
import HoldingsSection from "@/src/components/trading/HoldingsSection";
import MarketHeader from "@/src/components/trading/MarketHeader";
import PriceChart from "@/src/components/trading/PriceChart";
import TimeframeSelector from "@/src/components/trading/TimeframeSelector";
import ThemedText from "@/src/components/common/ThemedText";
import { ThemeColor } from "@/src/constants/theme";
import { useMarketPrices } from "@/src/hooks/useMarketPrices";
import { useCandlestickChangePercent, useCandlesticks } from "@/src/hooks/useCandlesticks";
import { processPriceTick } from "@/src/lib/candlestick-store";

const TIMEFRAMES = ["1m", "5m", "30m", "1h", "6h", "1d", "3d"];
const SUPPORTED_SYMBOLS = ["BTC", "ETH", "SOL"] as const;
type SupportedSymbol = (typeof SUPPORTED_SYMBOLS)[number];

const SYMBOL_TO_PAIR: Record<SupportedSymbol, string> = {
  BTC: "BTC/USD",
  ETH: "ETH/USD",
  SOL: "SOL/USD",
};

const SYMBOL_TO_WS_SYMBOL: Record<SupportedSymbol, string> = {
  BTC: "BTCUSDT",
  ETH: "ETHUSDT",
  SOL: "SOLUSDT",
};

const SYMBOL_ICON_MAP: Record<SupportedSymbol, any> = {
  BTC: require("../../../../assets/images/exness/btc.png"),
  ETH: require("../../../../assets/images/exness/eth.png"),
  SOL: require("../../../../assets/images/exness/solana.png"),
};

export default function MarketsScreen() {
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>("1m");
  const [selectedSymbol, setSelectedSymbol] = useState<SupportedSymbol>("BTC");
  const [isSymbolMenuOpen, setIsSymbolMenuOpen] = useState(false);

  const prices = useMarketPrices((symbol, price, time) => {
    processPriceTick({ symbol, price, time });
  });
  const wsSymbol = SYMBOL_TO_WS_SYMBOL[selectedSymbol];
  const pairLabel = SYMBOL_TO_PAIR[selectedSymbol];

  const currentPrice = prices[wsSymbol];
  const midPrice = useMemo(() => {
    if (!currentPrice) return undefined;
    if (currentPrice.ask === 0 && currentPrice.bid === 0) return undefined;
    if (currentPrice.ask && currentPrice.bid) {
      return (currentPrice.ask + currentPrice.bid) / 2;
    }
    return currentPrice.ask || currentPrice.bid || undefined;
  }, [currentPrice]);

  const { changePercent } = useCandlestickChangePercent(
    wsSymbol,
    selectedTimeframe
  );
  const { data: candleData } = useCandlesticks(wsSymbol, selectedTimeframe);
  const lastClose =
    candleData && candleData.length ? candleData[candleData.length - 1].close : undefined;

  const displayPrice = currentPrice?.ask ?? midPrice ?? lastClose;

  const assetIconSource = useMemo(
    () => SYMBOL_ICON_MAP[selectedSymbol],
    [selectedSymbol]
  );

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top", "bottom", "left", "right"]}
    >
      <StatusBar barStyle="light-content" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerSection}>
          <Pressable onPress={() => setIsSymbolMenuOpen((open) => !open)}>
            <MarketHeader
              baseSymbol={selectedSymbol}
              pair={pairLabel}
              price={displayPrice}
              changePercent={changePercent}
              iconSource={assetIconSource}
            />
          </Pressable>

          {isSymbolMenuOpen && (
            <View style={styles.symbolMenu}>
              {SUPPORTED_SYMBOLS.map((symbol) => (
                <TouchableOpacity
                  key={symbol}
                  style={styles.symbolMenuItem}
                  activeOpacity={0.8}
                  onPress={() => {
                    setSelectedSymbol(symbol);
                    setIsSymbolMenuOpen(false);
                  }}
                >
                  <Image
                    source={SYMBOL_ICON_MAP[symbol]}
                    style={styles.symbolMenuIcon}
                  />
                  <View>
                    <ThemedText size="sm" variant="primary">
                      {symbol}
                    </ThemedText>
                    <ThemedText size="xs" variant="secondary">
                      {SYMBOL_TO_PAIR[symbol]}
                    </ThemedText>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <TimeframeSelector
          options={TIMEFRAMES}
          selected={selectedTimeframe}
          onChange={setSelectedTimeframe}
        />

        <PriceChart symbol={wsSymbol} timeframe={selectedTimeframe} />

        <ActionButtons />

        <HoldingsSection hasPosition={false} />

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: ThemeColor.background.app,
  },
  scroll: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  bottomSpacer: {
    height: 16,
  },
  headerSection: {
    marginBottom: 12,
  },
  symbolMenu: {
    marginTop: 4,
    backgroundColor: "#09090B",
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: "#27272A",
  },
  symbolMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    gap: 8,
  },
  symbolMenuIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
});