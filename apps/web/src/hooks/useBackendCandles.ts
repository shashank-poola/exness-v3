import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';

export interface BackendCandle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export function useBackendCandles(symbol: string, timeframe: string) {
  return useQuery({
    queryKey: ['backendCandles', symbol, timeframe],
    queryFn: async () => {
      try {
        const response = await api.get('/trade/candlesticks', {
          params: { symbol, timeframe }
        });
        return response.data as { candlesticks: BackendCandle[] };
      } catch (error) {
        console.error('Failed to fetch candlesticks from backend:', error);
        return { candlesticks: [] }; // Return empty candles on error
      }
    },
    refetchInterval: 5000, // Refetch every 5 seconds to get latest data
    retry: 1, // Only retry once
    staleTime: 2000, // Consider data fresh for 2 seconds
  });
}