import apiCaller from './api.service';
import type { OrderRequest, OpenOrder, ClosedOrder, CreateOrderResponse } from '../types/order.type';
import type { CandlesticksResponse } from '../types/candle.type';
import { logger } from './logger.service';
import { ServerError, Ok, type ServiceResult } from '../utils/api-result';

export async function createOrderService( input: OrderRequest ): Promise<ServiceResult<CreateOrderResponse>> {
  try {
    const data = await apiCaller.post<CreateOrderResponse>('/trade/create-order', input);
    return Ok(data);
  } catch (error) {
    logger.error('createOrderService', 'Error creating order', error);
    return ServerError();
  }
}

export async function closeOrderService(orderId: string): Promise<ServiceResult<{ message: string }>> {
  try {
    const data = await apiCaller.post<{ message: string }>('/trade/close-order', { orderId });
    return Ok(data);
  } catch (error) {
    logger.error('closeOrderService', 'Error closing order', error);

    return ServerError();
  }
}

export async function getOpenOrdersService(): Promise<ServiceResult<OpenOrder[]>> {
  try {
    const data = await apiCaller.get<{ orders: OpenOrder[] }>('/trade/get-open-orders');
    return Ok(data.orders);
  } catch (error) {
    logger.error('getOpenOrdersService', 'Error fetching open orders', error);

    return ServerError();
  }
}

export async function getClosedOrdersService(): Promise<ServiceResult<ClosedOrder[]>> {
  try {
    const data = await apiCaller.get<{ orders: ClosedOrder[] }>('/trade/get-close-orders');
    return Ok(data.orders);
  } catch (error) {
    logger.error('getClosedOrdersService', 'Error fetching closed orders', error);

    return ServerError();
  }
}

export async function getCandlesticksService( symbol: string, timeframe: string ): Promise<ServiceResult<CandlesticksResponse>> {
  try {
    const data = await apiCaller.get<CandlesticksResponse>(
      `/trade/candlesticks?symbol=${encodeURIComponent(symbol)}&timeframe=${encodeURIComponent(timeframe)}`
    );
    return Ok(data);
  } catch (error) {
    logger.error('getCandlesticksService', 'Error fetching candlesticks', error);

    return ServerError();
  }
}