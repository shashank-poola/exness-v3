import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, Image, LayoutChangeEvent, Pressable, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";

import ThemedText from "@/src/components/common/ThemedText";
import { ThemeColor } from "@/src/constants/theme";
import {
  SUPPORTED_SYMBOLS,
  SYMBOL_ICON_MAP,
  SYMBOL_TO_WS_SYMBOL,
  type SupportedSymbol,
} from "@/src/constants/markets";
import { useMarketPrices } from "@/src/hooks/useMarketPrices";
import { useCandlesticks } from "@/src/hooks/useCandlesticks";

type TickerInfo = {
  symbol: SupportedSymbol;
  wsSymbol: string;
};

const TICKERS: TickerInfo[] = SUPPORTED_SYMBOLS.map((symbol) => ({
  symbol,
  wsSymbol: SYMBOL_TO_WS_SYMBOL[symbol],
}));

const PriceMarquee: React.FC = () => {
  const router = useRouter();
  const prices = useMarketPrices();
  const [containerWidth, setContainerWidth] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);
  const translateX = useRef(new Animated.Value(0)).current;

  const { changeBySymbol, fallbackPriceBySymbol } = useSymbolStats();

  useEffect(() => {
    if (!containerWidth || !contentWidth) return;

    const singleWidth = contentWidth / 2;
    if (!singleWidth) return;

    translateX.stopAnimation();
    translateX.setValue(0);

    const distance = singleWidth;
    const duration = Math.max(12000, distance * 30);

    const animation = Animated.loop(
      Animated.timing(translateX, {
        toValue: -singleWidth,
        duration,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [containerWidth, contentWidth, translateX]);

  const handleContainerLayout = (e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width);
  };

  const handleContentLayout = (e: LayoutChangeEvent) => {
    setContentWidth(e.nativeEvent.layout.width);
  };

  return (
    <View style={styles.outer} onLayout={handleContainerLayout}>
      <Animated.View
        style={[styles.marqueeContent, { transform: [{ translateX }] }]}
        onLayout={handleContentLayout}
      >
        {([...TICKERS, ...TICKERS] as TickerInfo[]).map((item, index) => {
          const priceEntry = prices[item.wsSymbol];
          const wsPrice = priceEntry ? priceEntry.bid : undefined;
          const fallback = fallbackPriceBySymbol[item.symbol];
          const price = wsPrice ?? fallback;
          const change = changeBySymbol[item.symbol];
          const isPositive = change != null && change >= 0;

          const changeColor = isPositive
            ? ThemeColor.status.success
            : ThemeColor.status.error;

          return (
            <Pressable
              style={styles.tickerItem}
              key={`${item.symbol}-${index}`}
              onPress={() =>
                router.push({
                  pathname: "/(tabs)/markets/[symbol]",
                  params: { symbol: item.symbol },
                })
              }
            >
              <Image source={SYMBOL_ICON_MAP[item.symbol]} style={styles.icon} />
              <ThemedText size="sm" variant="primary" style={styles.priceText}>
                {formatPrice(price)}
              </ThemedText>
              {change != null && (
                <ThemedText size="sm" style={[styles.changeInline, { color: changeColor }]}>
                  {isPositive ? "▲" : "▼"} {Math.abs(change).toFixed(2)}%
                </ThemedText>
              )}
              {index < TICKERS.length * 2 - 1 && (
                <View style={styles.separatorWrapper}>
                  <ThemedText size="sm" variant="secondary">
                    |
                  </ThemedText>
                </View>
              )}
            </Pressable>
          );
        })}
      </Animated.View>
    </View>
  );
};

function useSymbolStats(): {
  changeBySymbol: Record<SupportedSymbol, number | undefined>;
  fallbackPriceBySymbol: Record<SupportedSymbol, number | undefined>;
} {
  const { data: btcData } = useCandlesticks(SYMBOL_TO_WS_SYMBOL.BTC, "1h");
  const { data: ethData } = useCandlesticks(SYMBOL_TO_WS_SYMBOL.ETH, "1h");
  const { data: solData } = useCandlesticks(SYMBOL_TO_WS_SYMBOL.SOL, "1h");

  const { btcChange, btcLast } = useMemo(() => {
    if (!btcData || btcData.length < 2) {
      const last = btcData && btcData.length ? btcData[btcData.length - 1]?.close : undefined;
      return { btcChange: 0, btcLast: last };
    }
    const first = btcData[0];
    const last = btcData[btcData.length - 1];
    if (!first.open) return { btcChange: 0, btcLast: last.close };
    const diff = last.close - first.open;
    const change = (diff / first.open) * 100;
    return { btcChange: change, btcLast: last.close };
  }, [btcData]);

  const { ethChange, ethLast } = useMemo(() => {
    if (!ethData || ethData.length < 2) {
      const last = ethData && ethData.length ? ethData[ethData.length - 1]?.close : undefined;
      return { ethChange: 0, ethLast: last };
    }
    const first = ethData[0];
    const last = ethData[ethData.length - 1];
    if (!first.open) return { ethChange: 0, ethLast: last.close };
    const diff = last.close - first.open;
    const change = (diff / first.open) * 100;
    return { ethChange: change, ethLast: last.close };
  }, [ethData]);

  const { solChange, solLast } = useMemo(() => {
    if (!solData || solData.length < 2) {
      const last = solData && solData.length ? solData[solData.length - 1]?.close : undefined;
      return { solChange: 0, solLast: last };
    }
    const first = solData[0];
    const last = solData[solData.length - 1];
    if (!first.open) return { solChange: 0, solLast: last.close };
    const diff = last.close - first.open;
    const change = (diff / first.open) * 100;
    return { solChange: change, solLast: last.close };
  }, [solData]);

  const changeBySymbol: Record<SupportedSymbol, number | undefined> = useMemo(
    () => ({
      BTC: btcChange,
      ETH: ethChange,
      SOL: solChange,
    }),
    [btcChange, ethChange, solChange]
  );

  const fallbackPriceBySymbol: Record<SupportedSymbol, number | undefined> = useMemo(
    () => ({
      BTC: btcLast,
      ETH: ethLast,
      SOL: solLast,
    }),
    [btcLast, ethLast, solLast]
  );

  return { changeBySymbol, fallbackPriceBySymbol };
}

function formatPrice(price: number | undefined): string {
  if (price == null || !isFinite(price)) return "--";
  if (price >= 1000) {
    return price.toLocaleString(undefined, { maximumFractionDigits: 2 });
  }
  return price.toFixed(4);
}

const styles = StyleSheet.create({
  outer: {
    marginHorizontal: 0,
    marginTop: 8,
    overflow: "hidden",
    backgroundColor: "#000000",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  marqueeContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  tickerItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginRight: 24,
  },
  icon: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  textBlock: {
    flexDirection: "column",
    gap: 2,
  },
  priceText: {
    marginRight: 6,
    fontSize: 16,
  },
  changeInline: {
    fontSize: 14,
  },
  changeText: {
    fontSize: 11,
  },
  positive: {
    color: ThemeColor.status.success,
  },
  negative: {
    color: ThemeColor.status.error,
  },
  separator: {
    marginLeft: 8,
  },
  separatorWrapper: {
    marginLeft: 8,
  },
});

export default PriceMarquee;

