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
import { useCandlestickChangePercent } from "@/src/hooks/useCandlesticks";

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

  const { btcChange } = useSymbolChange("BTC");
  const { ethChange } = useSymbolChange("ETH");
  const { solChange } = useSymbolChange("SOL");

  const changeBySymbol: Record<SupportedSymbol, number | undefined> = useMemo(
    () => ({
      BTC: btcChange,
      ETH: ethChange,
      SOL: solChange,
    }),
    [btcChange, ethChange, solChange]
  );

  useEffect(() => {
    if (!containerWidth || !contentWidth) return;

    translateX.stopAnimation();
    translateX.setValue(containerWidth);

    const distance = containerWidth + contentWidth;
    const duration = Math.max(12000, distance * 30);

    const animation = Animated.loop(
      Animated.timing(translateX, {
        toValue: -contentWidth,
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
        {TICKERS.map((item, index) => {
          const priceEntry = prices[item.wsSymbol];
          const price = priceEntry ? priceEntry.ask || priceEntry.bid || 0 : 0;
          const change = changeBySymbol[item.symbol];
          const isPositive = change != null && change >= 0;

          const changeColor = isPositive
            ? ThemeColor.status.success
            : ThemeColor.status.error;

          return (
            <Pressable
              style={styles.tickerItem}
              key={item.symbol}
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
              {index < TICKERS.length - 1 && (
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

function useSymbolChange(symbol: SupportedSymbol) {
  const wsSymbol = SYMBOL_TO_WS_SYMBOL[symbol];
  const { changePercent } = useCandlestickChangePercent(wsSymbol, "1h");

  if (symbol === "BTC") return { btcChange: changePercent };
  if (symbol === "ETH") return { ethChange: changePercent };
  return { solChange: changePercent };
}

function formatPrice(price: number | undefined): string {
  if (!price || !isFinite(price)) return "--";
  if (price >= 1000) {
    return price.toLocaleString(undefined, { maximumFractionDigits: 2 });
  }
  return price.toFixed(4);
}

const styles = StyleSheet.create({
  outer: {
    marginHorizontal: 16,
    marginTop: 12,
    overflow: "hidden",
    borderRadius: 999,
    backgroundColor: "#09090B",
    borderWidth: 1,
    borderColor: "#27272A",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  marqueeContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  tickerItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginRight: 18,
  },
  icon: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  textBlock: {
    flexDirection: "column",
    gap: 2,
  },
  priceText: {
    marginRight: 4,
  },
  changeInline: {
    fontSize: 12,
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

