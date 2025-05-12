import { abi } from "contracts-js";
import { useReadContract } from "wagmi";

export function useFeeTokenBalance(address: `0x${string}` | undefined) {
  // Get fee token address from clone factory
  const { data: feeTokenAddress } = useReadContract({
    address: process.env.REACT_APP_CLONE_FACTORY,
    abi: abi.cloneFactoryAbi,
    functionName: "feeToken",
    query: {
      staleTime: Number.POSITIVE_INFINITY,
      gcTime: Number.POSITIVE_INFINITY,
    },
  });

  // Read balance using the fee token address
  const {
    data: balance,
    isLoading,
    error,
  } = useReadContract({
    address: feeTokenAddress,
    abi: abi.usdcMockAbi,
    functionName: "balanceOf",
    args: [address!],
    query: {
      enabled: !!address && !!feeTokenAddress,
    },
  });

  return {
    balance,
    isLoading,
    error,
  };
}
