import apiCaller from "./api.service";
import { Ok, ServerError, type ServiceResult } from "../utils/api-result";
import { logger } from "./logger.service";

// Unified balance service: adapts /balance/me { message: number } response
export async function getUserBalanceService(): Promise<ServiceResult<number>> {
  try {
    const data = await apiCaller.get<{ message: number }>("/balance/me");
    return Ok(data.message);
  } catch (error) {
    logger.error("getUserBalanceService", "Error fetching user balance", error);
    return ServerError();
  }
}