import { useReadContract } from "wagmi";
import { backgroundRefetchOpts } from "./config";
import { cloneFactoryAbi, usdcMockAbi } from "contracts-js/dist/abi/abi";

export function useFeeTokenAddress() {
  return useReadContract({
    address: process.env.REACT_APP_CLONE_FACTORY,
    abi: cloneFactoryAbi,
    functionName: "feeToken",
    query: {
      staleTime: Number.POSITIVE_INFINITY,
      gcTime: Number.POSITIVE_INFINITY,
    },
  });
}

export function useFeeTokenBalance(address: `0x${string}` | undefined, refetch = true) {
  const { data: feeTokenAddress } = useFeeTokenAddress();

  return useReadContract({
    address: feeTokenAddress,
    abi: usdcMockAbi,
    functionName: "balanceOf",
    args: [address!],
    query: {
      ...(refetch ? backgroundRefetchOpts : {}),
      enabled: !!address && !!feeTokenAddress,
    },
  });
}
