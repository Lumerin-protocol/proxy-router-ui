import { abi } from "contracts-js";
import { useReadContract } from "wagmi";
import { backgroundRefetchOpts } from "./config";

export function useFeeTokenAddress() {
  return useReadContract({
    address: process.env.REACT_APP_CLONE_FACTORY,
    abi: abi.cloneFactoryAbi,
    functionName: "feeToken",
    query: {
      staleTime: Number.POSITIVE_INFINITY,
      gcTime: Number.POSITIVE_INFINITY,
    },
  });
}

export function useFeeTokenBalance(address: `0x${string}` | undefined) {
  const { data: feeTokenAddress } = useFeeTokenAddress();

  return useReadContract({
    address: feeTokenAddress,
    abi: abi.usdcMockAbi,
    functionName: "balanceOf",
    args: [address!],
    query: {
      ...backgroundRefetchOpts,
      enabled: !!address && !!feeTokenAddress,
    },
  });
}
