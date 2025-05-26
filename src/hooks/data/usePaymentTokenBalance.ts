import { abi } from "contracts-js";
import { useReadContract } from "wagmi";
import { backgroundRefetchOpts } from "./config";

export function usePaymentTokenAddress() {
  return useReadContract({
    address: process.env.REACT_APP_CLONE_FACTORY,
    abi: abi.cloneFactoryAbi,
    functionName: "paymentToken",
    query: {
      staleTime: Number.POSITIVE_INFINITY,
      gcTime: Number.POSITIVE_INFINITY,
    },
  });
}

export function usePaymentTokenBalance(address: `0x${string}` | undefined) {
  const { data: paymentTokenAddress } = usePaymentTokenAddress();

  // Read balance using the payment token address
  return useReadContract({
    address: paymentTokenAddress,
    abi: abi.usdcMockAbi,
    functionName: "balanceOf",
    args: [address!],
    query: {
      ...backgroundRefetchOpts,
      enabled: !!address && !!paymentTokenAddress,
    },
  });
}
