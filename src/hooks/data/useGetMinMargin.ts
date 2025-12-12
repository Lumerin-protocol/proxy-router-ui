import { useReadContract } from "wagmi";
import { FuturesABI } from "../../abi/Futures";

export function useGetMinMargin(address: `0x${string}` | undefined) {
  return useReadContract({
    address: process.env.REACT_APP_FUTURES_TOKEN_ADDRESS,
    abi: FuturesABI,
    functionName: "getMinMargin",
    args: [address!],
    query: {
      refetchInterval: 10000, // Poll every 10 seconds
      refetchOnMount: true,
      refetchOnWindowFocus: true,
    },
  });
}
