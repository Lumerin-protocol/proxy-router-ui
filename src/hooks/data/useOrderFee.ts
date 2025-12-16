import { useReadContract } from "wagmi";
import { FuturesABI } from "../../abi/Futures";

/**
 * Hook to get order fee from Futures contract
 * Cached to avoid unnecessary refetches
 */
export function useOrderFee() {
  const result = useReadContract({
    address: process.env.REACT_APP_FUTURES_TOKEN_ADDRESS,
    abi: FuturesABI,
    functionName: "orderFee",
    query: {
      staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
      gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
      refetchOnMount: false, // Don't refetch on every mount
      refetchOnWindowFocus: false, // Don't refetch on window focus
    },
  });

  return {
    ...result,
    // Convert bigint to number in USDC (divide by 1e6)
    orderFeeUSDC: result.data ? Number(result.data) / 1e6 : null,
    dataFetchedAt: result.dataUpdatedAt ? new Date(result.dataUpdatedAt) : undefined,
  };
}
