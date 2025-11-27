import { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickData } from 'lightweight-charts';
import { useCandles, Candle } from '@/hooks/useCandles';
import { useWebSocket } from '@/hooks/useWebSocket';
import { getSymbolPrice } from '@/lib/price-store';

interface TradingChartProps {
  symbol: string;
  interval: string;
}

export function TradingChart({ symbol, interval }: TradingChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { data: candles, isLoading: candlesLoading } = useCandles(symbol, interval);

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: '#ffffff' },
        textColor: '#333',
      },
      grid: {
        vertLines: { color: '#f0f0f0' },
        horzLines: { color: '#f0f0f0' },
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      rightPriceScale: {
        borderColor: '#e0e0e0',
      },
      timeScale: {
        borderColor: '#e0e0e0',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderUpColor: '#22c55e',
      borderDownColor: '#ef4444',
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;

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

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  // Update chart with candle data
  useEffect(() => {
    if (!candleSeriesRef.current || !candles || candles.length === 0) return;

    const chartData: CandlestickData[] = candles.map((candle: Candle) => ({
      time: candle.time as any,
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
    }));

    candleSeriesRef.current.setData(chartData);
    setIsLoading(false);

    console.log('📈 Chart updated with', chartData.length, 'candles');
  }, [candles]);

  // Update chart with real-time prices
  useWebSocket((msg) => {
    if (msg.symbol !== symbol || !candleSeriesRef.current) return;

    const currentPrice = getSymbolPrice(symbol);
    if (!currentPrice) return;

    // Update the last candle with current price
    const now = Math.floor(Date.now() / 1000);
    const lastCandle = candles?.[candles.length - 1];

    if (lastCandle) {
      const updatedCandle: CandlestickData = {
        time: lastCandle.time as any,
        open: lastCandle.open,
        high: Math.max(lastCandle.high, currentPrice.ask, currentPrice.bid),
        low: Math.min(lastCandle.low, currentPrice.ask, currentPrice.bid),
        close: msg.type === 'BID' ? currentPrice.bid : currentPrice.ask,
      };

      candleSeriesRef.current.update(updatedCandle);
    }
  });

  return (
    <div className="relative w-full h-full">
      <div ref={chartContainerRef} className="w-full h-full" />
      {(isLoading || candlesLoading) && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80">
          <div className="text-sm text-gray-500">Loading chart data...</div>
        </div>
      )}
    </div>
  );
}
