import { getBalanceService } from "../services/balance.service";
import { useQuery } from "@tanstack/react-query";

export const useBalance = () => {
    return useQuery({
      queryKey: ['balance'],
      queryFn: async () => {
        try {
          const result = await getBalanceService();
          return result.success && result.data;
        } catch (error) {
          console.error('Failed to fetch balance:', error);
          return { balance: 0 }; // Return 0 balance on error
        }
      },
      refetchInterval: 5000, // Refetch every 5 seconds
      retry: 1,
    });
  }