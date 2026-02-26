import React, { useEffect, useMemo, useState } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import Svg, { Rect } from "react-native-svg";
import { ThemeColor } from "@/src/constants/theme";
import { useCandlesticks } from "@/src/hooks/useCandlesticks";
import { getCandlesticks } from "@/src/lib/candlestick-store";
import type { Candlestick } from "@/src/types/candle.type";
import TradingViewChart from "./TradingViewChart";
import { PriceChartProps } from "@/src/types/candle.type";
import { CHART_DEFAULT_HEIGHT, MERGE_INTERVAL_MS } from "@/src/constants/markets";

function mergeCandles( backend: Candlestick[], live: Candlestick[] ): Candlestick[] {
  const byTime = new Map<number, Candlestick>();
  backend.forEach((c) => byTime.set(c.time, c));
  live.forEach((c) => byTime.set(c.time, c));

  return Array.from(byTime.values()).sort((a, b) => a.time - b.time).slice(-500);
}

const PriceChart: React.FC<PriceChartProps> = ({ symbol, timeframe, height = CHART_DEFAULT_HEIGHT }) => {
  const width = Dimensions.get("window").width - 32;
  const { data: backendCandles, isLoading } = useCandlesticks(symbol, timeframe);
  const [mergedCandles, setMergedCandles] = useState<Candlestick[]>([]);

  useEffect(() => {
    const runMerge = () => {
      const live = getCandlesticks(symbol, timeframe);
      const backend = backendCandles ?? [];
      setMergedCandles(mergeCandles(backend, live));
    };

    runMerge();
    const id = setInterval(runMerge, MERGE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [symbol, timeframe, backendCandles]);

  const chartCandles = useMemo(
    () => mergedCandles.slice(-500),
    [mergedCandles]
  );

  const hasData = chartCandles.length > 0;

  return (
    <View style={[styles.container, { height, width }]}>
      {hasData ? (
        <TradingViewChart
          candles={chartCandles}
          width={width}
          height={height}
        />
      ) : (
        <Svg width={width} height={height}>
          <Rect
            x={0}
            y={0}
            width={width}
            height={height}
            fill="#09090B"
            opacity={isLoading ? 0.7 : 1}
            rx={16}
            ry={16}
          />
          <Rect
            x={0.5}
            y={0.5}
            width={width - 1}
            height={height - 1}
            stroke={ThemeColor.graph.border}
            strokeWidth={1}
            rx={16}
            ry={16}
            fill="transparent"
            opacity={0.5}
          />
        </Svg>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    borderRadius: 16,
    marginBottom: 24,
  },
});

export default PriceChart;
