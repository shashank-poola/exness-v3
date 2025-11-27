import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';

interface CreateOrderData {
  asset: string;
  side: 'LONG' | 'SHORT';
  quantity: number;
  leverage: number;
  tradeOpeningPrice: number;
  stopLoss?: number;
  takeProfit?: number;
  slippage: number;
}

interface CloseOrderData {
  orderId: string;
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateOrderData) => {
      const response = await api.post('/trade/create-order', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['openOrders'] });
      queryClient.invalidateQueries({ queryKey: ['balance'] });
    },
  });
}

export function useCloseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CloseOrderData) => {
      const response = await api.post('/trade/close-order', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['openOrders'] });
      queryClient.invalidateQueries({ queryKey: ['balance'] });
    },
  });
}

export function useOpenOrders() {
  return useQuery({
    queryKey: ['openOrders'],
    queryFn: async () => {
      const response = await api.get('/trade/get-open-orders');
      return response.data;
    },
    refetchInterval: 3000, // Refetch every 3 seconds
  });
}

export function useBalance() {
  return useQuery({
    queryKey: ['balance'],
    queryFn: async () => {
      const response = await api.get('/balance/me');
      return response.data;
    },
    refetchInterval: 5000, // Refetch every 5 seconds
  });
}
