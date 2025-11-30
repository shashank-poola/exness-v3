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
      queryClient.invalidateQueries({ queryKey: ['closedOrders'] });
      queryClient.invalidateQueries({ queryKey: ['balance'] });
    },
  });
}

export function useOpenOrders() {
  return useQuery({
    queryKey: ['openOrders'],
    queryFn: async () => {
      try {
        const response = await api.get('/trade/get-open-orders');
        return response.data;
      } catch (error) {
        console.error('Failed to fetch open orders:', error);
        return { orders: [] }; // Return empty orders on error
      }
    },
    refetchInterval: 3000, // Refetch every 3 seconds
    retry: 1, // Only retry once
  });
}

export function useClosedOrders() {
  return useQuery({
    queryKey: ['closedOrders'],
    queryFn: async () => {
      try {
        const response = await api.get('/trade/get-close-orders');
        return response.data;
      } catch (error) {
        console.error('Failed to fetch closed orders:', error);
        return { orders: [] }; // Return empty orders on error
      }
    },
    refetchInterval: 5000, // Refetch every 5 seconds
    retry: 1, // Only retry once
  });
}

export function useAllOrders() {
  const { data: openOrders } = useOpenOrders();
  const { data: closedOrders } = useClosedOrders();

  const allOrders = [
    ...(openOrders?.orders || []),
    ...(closedOrders?.orders || [])
  ];

  return { orders: allOrders };
}

export function useBalance() {
  return useQuery({
    queryKey: ['balance'],
    queryFn: async () => {
      try {
        const response = await api.get('/balance/me');
        return response.data;
      } catch (error) {
        console.error('Failed to fetch balance:', error);
        return { balance: 0 }; // Return 0 balance on error
      }
    },
    refetchInterval: 5000, // Refetch every 5 seconds
    retry: 1, // Only retry once
  });
}
