import apiCaller from './api.service';
import type { BalanceResponse } from '../types/user.type';
import { ServerError, Ok, type ServiceResult } from '../utils/api-result';
import { logger } from './logger.service';

export async function getBalanceService(): Promise<ServiceResult<BalanceResponse>> {
    try {
        const data = await apiCaller.get<BalanceResponse>('/balance/me');
        return Ok(data);

    } catch (error) {
        logger.error('getBalance', "Error getting user Balance", error);

        return ServerError();
    }
}