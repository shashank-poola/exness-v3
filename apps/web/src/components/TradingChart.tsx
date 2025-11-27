import { useEffect, useRef } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickSeriesPartialOptions } from 'lightweight-charts';
import { getCandlesticks } from '@/lib/candlestick-store';

interface TradingChartProps {
  symbol: string;
  interval: string;
}

export function TradingChart({ symbol, interval }: TradingChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart with white background
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: '#FFFFFF' },
        textColor: '#191919',
      },
      grid: {
        vertLines: { color: '#F0F0F0' },
        horzLines: { color: '#F0F0F0' },
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
    });

    chartRef.current = chart;

    // Add candlestick series
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
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
