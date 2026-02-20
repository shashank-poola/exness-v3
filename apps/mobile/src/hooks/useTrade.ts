import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createOrderService, closeOrderService, getOpenOrdersService, getClosedOrdersService } from '../services/trade.service';
import { QueryKeys } from '../types/queryKeys.type';
import type { OrderRequest } from '../types/order.type';

export const useCreateTrade = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: OrderRequest) => unwrap(() => createOrderService(input)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.OPEN_TRADES] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.USER_BALANCE] });
    },
  });
};

export const useCloseTrade = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) => unwrap(() => closeOrderService(orderId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.OPEN_TRADES] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.CLOSE_TRADES] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.USER_BALANCE] });
    },
  });
};

async function unwrap<T>(fn: () => Promise<{ success: boolean; data?: T; error?: string }>) {
    const result = await fn();
    if (result.success && result.data !== undefined) return result.data;
    throw new Error(result.error ?? 'Request failed');
  }

export const useOpenTrades = () => {
  return useQuery({
    queryKey: [QueryKeys.OPEN_TRADES],
    queryFn: () => unwrap(getOpenOrdersService),
    staleTime: 1000 * 60,
  });
};

export const useCloseTrades = () => {
  return useQuery({
    queryKey: [QueryKeys.CLOSE_TRADES],
    queryFn: () => unwrap(getClosedOrdersService),
    staleTime: 1000 * 60,
  });
};