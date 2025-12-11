import { useEffect, useRef, useMemo } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickSeriesPartialOptions } from 'lightweight-charts';
import { getCandlesticks } from '@/lib/candlestick-store';
import { useTheme } from '@/contexts/ThemeContext';
import { useBackendCandles } from '@/hooks/useBackendCandles';

interface TradingChartProps {
  symbol: string;
  interval: string;
}

// Calculate appropriate tick size based on timeframe
function getTickSize(interval: string): number {
  const tickSizes: Record<string, number> = {
    '1m': 20,    // $20 increments for 1 minute
    '5m': 50,    // $50 increments for 5 minutes
    '30m': 100,  // $100 increments for 30 minutes
    '1h': 200,   // $200 increments for 1 hour (current default)
    '6h': 500,   // $500 increments for 6 hours
    '1d': 1000,  // $1000 increments for 1 day
    '3d': 2000,  // $2000 increments for 3 days
  };
  return tickSizes[interval] || 200;
}

export function TradingChart({ symbol, interval }: TradingChartProps) {
  const { theme } = useTheme();
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);

  // Fetch historical candlestick data from backend
  const { data: backendData } = useBackendCandles(symbol, interval);

  // Combine backend and frontend candlestick data
  const allCandles = useMemo(() => {
    const frontendCandles = getCandlesticks(symbol, interval as any);
    const backendCandles = backendData?.candlesticks || [];

    // Merge backend and frontend data, ensuring no duplicates
    const merged = [...backendCandles];

    // Add frontend candles that aren't already in backend data
    frontendCandles.forEach(frontendCandle => {
      const exists = backendCandles.some(backendCandle => backendCandle.time === frontendCandle.time);
      if (!exists) {
        merged.push(frontendCandle);
      }
    });

    // Sort by time and limit to last 500 candles for performance
    return merged
      .sort((a, b) => a.time - b.time)
      .slice(-500);
  }, [backendData, symbol, interval]);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Get dynamic tick size based on timeframe
    const tickSize = getTickSize(interval);

    // Create chart with theme-aware colors
    const isDark = theme === 'dark';
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: isDark ? '#000000' : '#FFFFFF' },
        textColor: isDark ? '#D1D4DC' : '#191919',
      },
      grid: {
        vertLines: { color: isDark ? '#2B2B43' : '#E6E6E6' },
        horzLines: { color: isDark ? '#2B2B43' : '#E6E6E6' },
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: isDark ? '#2B2B43' : '#D1D4DC',
        timezone: 'Asia/Kolkata',
        tickMarkFormatter: (time: number, tickMarkType: number, locale: string) => {
          const date = new Date(time * 1000);

          // For different tick mark types, show different formats
          if (tickMarkType === 0) { // Year
            return date.toLocaleDateString('en-IN', {
              timeZone: 'Asia/Kolkata',
              year: 'numeric'
            });
          } else if (tickMarkType === 1) { // Month
            return date.toLocaleDateString('en-IN', {
              timeZone: 'Asia/Kolkata',
              month: 'short',
              day: 'numeric'
            });
          } else if (tickMarkType === 2) { // Day of month
            return date.toLocaleDateString('en-IN', {
              timeZone: 'Asia/Kolkata',
              month: 'short',
              day: 'numeric'
            });
          } else { // Time (hours/minutes)
            return date.toLocaleTimeString('en-IN', {
              timeZone: 'Asia/Kolkata',
              hour12: false,
              hour: '2-digit',
              minute: '2-digit'
            });
          }
        },
      },
      rightPriceScale: {
        borderColor: isDark ? '#2B2B43' : '#D1D4DC',
        ticksVisible: true,
        minimumWidth: 80,
      },
      crosshair: {
        mode: 1, // Normal crosshair mode
      },
    });

    chartRef.current = chart;

    // Add candlestick series with proper colors (green for bullish, red for bearish)
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#26a69a',        // Green for bullish (close > open)
      downColor: '#ef5350',      // Red for bearish (close < open)
      borderUpColor: '#26a69a',  // Green border for bullish
      borderDownColor: '#ef5350', // Red border for bearish
      wickUpColor: '#26a69a',    // Green wick for bullish
      wickDownColor: '#ef5350',  // Red wick for bearish
    });

    candlestickSeriesRef.current = candlestickSeries;

    // Load initial data
    const candles = getCandlesticks(symbol, interval as any);
    if (candles.length > 0) {
      candlestickSeries.setData(candles);
    }

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, [symbol, interval, theme]);

  // Initialize chart with backend data, then update with live frontend data
  useEffect(() => {
    if (candlestickSeriesRef.current) {
      // First, load backend historical data
      if (allCandles.length > 0) {
        const chartData = allCandles.map(candle => ({
          time: candle.time,
          open: candle.open,
          high: candle.high,
          low: candle.low,
          close: candle.close,
        }));
        candlestickSeriesRef.current.setData(chartData);
      }

      // Then, continuously update with live frontend data
      const updateInterval = setInterval(() => {
        const frontendCandles = getCandlesticks(symbol, interval as any);
        if (frontendCandles.length > 0) {
          candlestickSeriesRef.current.setData(frontendCandles);
        }
      }, 1000);

      return () => clearInterval(updateInterval);
    }
  }, [allCandles, symbol, interval]);

  return (
    <div
      ref={chartContainerRef}
      className="w-full h-full"
    />
  );
}
