import apiCaller from "./api.service";
import { Ok, ServerError, type ServiceResult } from "../utils/api-result";
import { logger } from "./logger.service";

// Backend returns { success, message, balance: number }. Use balance for the numeric value.
export async function getUserBalanceService(): Promise<ServiceResult<number>> {
  try {
    const data = await apiCaller.get<{ message?: string; balance?: number }>("/balance/me");
    const value = typeof data.balance === "number" ? data.balance : 0;
    return Ok(value);
  } catch (error) {
    logger.error("getUserBalanceService", "Error fetching user balance", error);
    return ServerError();
  }
}