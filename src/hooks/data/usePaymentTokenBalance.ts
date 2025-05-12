import { abi } from "contracts-js";
import { useReadContract } from "wagmi";

export function usePaymentTokenBalance(address: `0x${string}` | undefined) {
  // Get payment token address from clone factory
  const { data: paymentTokenAddress } = useReadContract({
    address: process.env.REACT_APP_CLONE_FACTORY,
    abi: abi.cloneFactoryAbi,
    functionName: "paymentToken",
    query: {
      staleTime: Number.POSITIVE_INFINITY,
      gcTime: Number.POSITIVE_INFINITY,
    },
  });

  // Read balance using the payment token address
  const {
    data: balance,
    isLoading,
    error,
  } = useReadContract({
    address: paymentTokenAddress,
    abi: abi.usdcMockAbi,
    functionName: "balanceOf",
    args: [address!],
    query: {
      enabled: !!address && !!paymentTokenAddress,
      refetchInterval: 60 * 1000,
    },
  });

  return {
    balance,
    isLoading,
    error,
  };
}
