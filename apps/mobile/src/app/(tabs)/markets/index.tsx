import React, { useEffect, useMemo, useRef, useState } from "react";
import { Dimensions, Image, Pressable, ScrollView, StatusBar, StyleSheet, TouchableOpacity, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import ActionButtons from "@/src/components/ActionButtons";
import PositionsSection from "@/src/components/PositionsSection";
import MarketHeader from "@/src/components/MarketHeader";
import PriceChart from "@/src/components/trading/PriceChart";
import TimeframeSelector from "@/src/components/TimeframeSelector";
import ThemedText from "@/src/components/common/ThemedText";
import ScreenHeader from "@/src/components/common/ScreenHeader";
import { ThemeColor } from "@/src/constants/theme";
import { useMarketPrices } from "@/src/hooks/useMarketPrices";
import { useCandlestickChangePercent, useCandlesticks } from "@/src/hooks/useCandlesticks";
import { processPriceTick } from "@/src/lib/candlestick-store";
import { SUPPORTED_SYMBOLS, SYMBOL_ICON_MAP, SYMBOL_TO_PAIR,
  SYMBOL_TO_WS_SYMBOL,
  type SupportedSymbol,
} from "@/src/constants/markets";
import OrderBottomSheet, {
  type OrderBottomSheetRef,
} from "@/src/components/OrderBottomSheet";

const TIMEFRAMES = ["1m", "5m", "30m", "1h", "6h", "1d", "3d"];
const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function MarketsScreen() {
  const params = useLocalSearchParams<{ symbol?: string }>();
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>("1m");
  const [selectedSymbol, setSelectedSymbol] = useState<SupportedSymbol>("BTC");
  const [isSymbolMenuOpen, setIsSymbolMenuOpen] = useState(false);
  const [symbolMenuTop, setSymbolMenuTop] = useState<number | null>(null);
  const router = useRouter();
  const orderSheetRef = useRef<OrderBottomSheetRef | null>(null);
  const headerRef = useRef<View | null>(null);

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

  const handleToggleSymbolMenu = () => {
    if (isSymbolMenuOpen) {
      setIsSymbolMenuOpen(false);
      setSymbolMenuTop(null);
      return;
    }

    if (headerRef.current) {
      headerRef.current.measure((_, y, __, height) => {
        const offset = 8;
        setSymbolMenuTop(y + height + offset);
        setIsSymbolMenuOpen(true);
      });
    } else {
      setIsSymbolMenuOpen(true);
    }
  };

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
          <Pressable ref={headerRef} onPress={handleToggleSymbolMenu}>
            <MarketHeader
              baseSymbol={selectedSymbol}
              pair={pairLabel}
              price={displayPrice}
              changePercent={changePercent}
              iconSource={assetIconSource}
            />
          </Pressable>
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

        <PositionsSection />

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {isSymbolMenuOpen && (
        <View style={styles.symbolMenuOverlay} pointerEvents="box-none">
          <Pressable
            style={styles.symbolMenuBackdrop}
            onPress={() => {
              setIsSymbolMenuOpen(false);
              setSymbolMenuTop(null);
            }}
            pointerEvents="box-only"
          />

          {symbolMenuTop != null && (
            <View
              style={[
                styles.symbolMenu,
                {
                  top: symbolMenuTop,
                  left: 16,
                },
              ]}
            >
              {SUPPORTED_SYMBOLS.map((symbol) => (
                <TouchableOpacity
                  key={symbol}
                  style={styles.symbolMenuItem}
                  activeOpacity={0.8}
                  onPress={() => {
                    setSelectedSymbol(symbol);
                    setIsSymbolMenuOpen(false);
                    setSymbolMenuTop(null);
                  }}
                >
                  <View style={styles.symbolMenuItemContent}>
                    <Image
                      source={SYMBOL_ICON_MAP[symbol]}
                      style={styles.symbolMenuIcon}
                    />
                    <View style={styles.symbolMenuTextContainer}>
                      <ThemedText
                        size="sm"
                        variant="primary"
                      >
                        {SYMBOL_TO_PAIR[symbol]}
                      </ThemedText>
                      <ThemedText
                        size="xs"
                        variant="secondary"
                      >
                        {symbol}
                      </ThemedText>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      )}

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
  symbolMenuOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 30,
  },
  symbolMenuBackdrop: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  symbolMenu: {
    backgroundColor: "#09090B",
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: "#27272A",
    maxHeight: 320,
    maxWidth: SCREEN_WIDTH - 32,
    alignSelf: "flex-start",
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
  symbolMenuItem: {
    paddingVertical: 8,
    borderRadius: 12,
  },
  symbolMenuItemContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  symbolMenuIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  symbolMenuTextContainer: {
    flexDirection: "column",
  },
});