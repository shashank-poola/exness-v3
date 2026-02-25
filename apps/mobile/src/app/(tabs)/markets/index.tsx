import React, { useEffect, useMemo, useRef, useState } from "react";
import { Image, Pressable, ScrollView, StatusBar, StyleSheet, TouchableOpacity, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import ActionButtons from "@/src/components/trading/ActionButtons";
import HoldingsSection from "@/src/components/trading/HoldingsSection";
import MarketHeader from "@/src/components/trading/MarketHeader";
import PriceChart from "@/src/components/trading/PriceChart";
import TimeframeSelector from "@/src/components/trading/TimeframeSelector";
import ThemedText from "@/src/components/common/ThemedText";
import ScreenHeader from "@/src/components/common/ScreenHeader";
import { ThemeColor } from "@/src/constants/theme";
import { useMarketPrices } from "@/src/hooks/useMarketPrices";
import { useCandlestickChangePercent, useCandlesticks } from "@/src/hooks/useCandlesticks";
import { processPriceTick } from "@/src/lib/candlestick-store";
import {
  SUPPORTED_SYMBOLS,
  SYMBOL_ICON_MAP,
  SYMBOL_TO_PAIR,
  SYMBOL_TO_WS_SYMBOL,
  type SupportedSymbol,
} from "@/src/constants/markets";
import OrderBottomSheet, {
  type OrderBottomSheetRef,
} from "@/src/components/trading/OrderBottomSheet";

const TIMEFRAMES = ["1m", "5m", "30m", "1h", "6h", "1d", "3d"];

export default function MarketsScreen() {
  const params = useLocalSearchParams<{ symbol?: string }>();
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>("1m");
  const [selectedSymbol, setSelectedSymbol] = useState<SupportedSymbol>("BTC");
  const [isSymbolMenuOpen, setIsSymbolMenuOpen] = useState(false);
  const router = useRouter();
  const orderSheetRef = useRef<OrderBottomSheetRef | null>(null);

  useEffect(() => {
    const raw = params.symbol;
    if (!raw) return;
    const upper = String(raw).toUpperCase();
    if (SUPPORTED_SYMBOLS.includes(upper as SupportedSymbol)) {
      setSelectedSymbol(upper as SupportedSymbol);
    }
  }, [params.symbol]);

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

  const assetIconSource = useMemo( () => SYMBOL_ICON_MAP[selectedSymbol], [selectedSymbol] );
  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top", "bottom", "left", "right"]}
    >
      <StatusBar barStyle="light-content" />

      <ScreenHeader
        onBackPress={() => router.push("/(tabs)/home")}
        onSearchPress={() => router.push("/(tabs)/markets/search")}
      />

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

        <ActionButtons
          onBuyPress={() => orderSheetRef.current?.open("BUY")}
          onSellPress={() => orderSheetRef.current?.open("SELL")}
        />

        <HoldingsSection symbol={selectedSymbol} />

        <View style={styles.bottomSpacer} />
      </ScrollView>
      <OrderBottomSheet
        ref={orderSheetRef}
        symbol={selectedSymbol}
        currentPrice={displayPrice}
      />
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
    paddingTop: 16,
  },
  bottomSpacer: {
    height: 16,
  },
  headerSection: {
    marginBottom: 6,
  },
  symbolMenu: {
    marginTop: 4,
    backgroundColor: "#09090B",
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: "#27272A",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 8,
  },
  symbolMenuItem: {
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  symbolMenuIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
});