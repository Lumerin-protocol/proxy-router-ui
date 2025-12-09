import { useReadContract } from "wagmi";
import { FuturesABI } from "../../abi/Futures";

/**
 * Hook to get current market price from Futures contract
 * Polls every 10 seconds to keep the price up to date
 */
export function useGetMarketPrice() {
  return useReadContract({
    address: process.env.REACT_APP_FUTURES_TOKEN_ADDRESS,
    abi: FuturesABI,
    functionName: "getMarketPrice",
    query: {
      refetchInterval: 10000, // Poll every 10 seconds
      refetchOnMount: true,
      refetchOnWindowFocus: true,
    },
  });
}
