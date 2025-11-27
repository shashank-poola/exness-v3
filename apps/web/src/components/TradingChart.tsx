import { useEffect, useRef } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickSeriesPartialOptions } from 'lightweight-charts';
import { getCandlesticks } from '@/lib/candlestick-store';

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
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Get dynamic tick size based on timeframe
    const tickSize = getTickSize(interval);

    // Create chart with white background (like reference image)
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: '#FFFFFF' },
        textColor: '#191919',
      },
      grid: {
        vertLines: { color: '#E6E6E6' },
        horzLines: { color: '#E6E6E6' },
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      timeScale: {
        timeVisible: true,
        secondsVisible: true,
        borderColor: '#D1D4DC',
      },
      rightPriceScale: {
        borderColor: '#D1D4DC',
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
  }, [symbol, interval]);

  // Update chart data periodically
  useEffect(() => {
    const updateInterval = setInterval(() => {
      if (candlestickSeriesRef.current) {
        const candles = getCandlesticks(symbol, interval as any);
        if (candles.length > 0) {
          // Update all candles
          candlestickSeriesRef.current.setData(candles);
        }
      }
    }, 1000); // Update every second

    return () => clearInterval(updateInterval);
  }, [symbol, interval]);

  return (
    <div
      ref={chartContainerRef}
      className="w-full h-full"
    />
  );
}
