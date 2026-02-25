import { useQuery } from "@tanstack/react-query";
import { QueryKeys } from "../types/queryKeys.type";
import { getUserBalanceService } from "../services/balance.service";

export function useUserBalance() {
  return useQuery<number>({
    queryKey: [QueryKeys.USER_BALANCE],
    queryFn: async () => {
      const result = await getUserBalanceService();
      if (result.success && typeof result.data === "number") {
        return result.data;
      }
      throw new Error(result.error ?? "Failed to fetch balance");
    },
    staleTime: 30_000,
  });
}

