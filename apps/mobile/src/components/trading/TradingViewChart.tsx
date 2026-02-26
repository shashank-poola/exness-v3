import React, { useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";
import type { Candlestick, TradingViewChartProps } from "@/src/types/candle.type";

const LIGHTWEIGHT_CHARTS_CDN =
  "https://cdn.jsdelivr.net/npm/lightweight-charts@4.2.0/dist/lightweight-charts.standalone.production.js";

const CHART_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
  <script src="${LIGHTWEIGHT_CHARTS_CDN}"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; background: #050509; }
    #chart { width: 100%; height: 100%; }
  </style>
</head>
<body>
  <div id="chart"></div>
  <script>
    var chart = null;
    var series = null;
    function init() {
      if (chart) return;
      var container = document.getElementById('chart');
      if (!container) return;
      chart = LightweightCharts.createChart(container, {
        layout: { background: { color: '#050509' }, textColor: '#D1D4DC' },
        grid: { vertLines: { color: '#1a1a1f' }, horzLines: { color: '#1a1a1f' } },
        width: container.clientWidth,
        height: container.clientHeight,
        timeScale: {
          timeVisible: false,
          secondsVisible: false,
          borderColor: '#2B2B43',
        },
        rightPriceScale: {
          visible: true,
          borderVisible: false,
          borderColor: 'transparent',
        },
      });
      series = chart.addAreaSeries({
        lineColor: '#E67E22',
        topColor: 'rgba(230, 126, 34, 0.4)',
        bottomColor: 'rgba(230, 126, 34, 0.0)',
        lineWidth: 2,
        priceLineVisible: true,
        lastValueVisible: true,
      });
    }
    function updateData(candles) {
      if (!candles || !Array.isArray(candles) || candles.length === 0) return;
      try {
        init();
        var data = candles.map(function(c) {
          return { time: c.time, value: c.close };
        });
        series.setData(data);
        chart.timeScale().fitContent();
      } catch (e) { console.warn('Chart update error', e); }
    }
    function resize(w, h) {
      if (chart && document.getElementById('chart')) {
        document.getElementById('chart').style.width = w + 'px';
        document.getElementById('chart').style.height = h + 'px';
        chart.applyOptions({ width: w, height: h });
      }
    }
  </script>
</body>
</html>
`;

const TradingViewChart: React.FC<TradingViewChartProps> = ({ candles, width, height }) => {
  const webViewRef = useRef<WebView>(null);
  const lastCandlesRef = useRef<string>("");

  useEffect(() => {
    if (!candles.length) return;
    const key = JSON.stringify(candles.slice(-100).map((c) => c.time));
    if (key === lastCandlesRef.current) return;
    lastCandlesRef.current = key;

    const script = `
      (function() {
        var candles = ${JSON.stringify(candles)};
        if (typeof updateData === 'function') updateData(candles);
        true;
      })();
    `;
    webViewRef.current?.injectJavaScript(script);
  }, [candles]);

  return (
    <View style={[styles.container, { width, height }]}>
      <WebView
        ref={webViewRef}
        source={{ html: CHART_HTML }}
        style={[styles.webview, { width, height }]}
        scrollEnabled={false}
        bounces={false}
        javaScriptEnabled
        originWhitelist={["*"]}
        onMessage={() => {}}
        onLoadEnd={() => {
          const script = `
            (function() {
              var candles = ${JSON.stringify(candles)};
              if (typeof updateData === 'function') updateData(candles);
              if (typeof resize === 'function') resize(${width}, ${height});
              true;
            })();
          `;
          webViewRef.current?.injectJavaScript(script);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    borderRadius: 16,
    backgroundColor: "#050509",
  },
  webview: {
    backgroundColor: "transparent",
  },
});

export default TradingViewChart;
