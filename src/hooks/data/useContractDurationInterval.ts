import { cloneFactoryAbi } from "contracts-js/dist/abi/abi";
import { useReadContract } from "wagmi";

export function useContractDurationInterval() {
  return useReadContract({
    address: process.env.REACT_APP_CLONE_FACTORY,
    abi: cloneFactoryAbi,
    functionName: "getContractDurationInterval",
    query: {
      staleTime: Number.POSITIVE_INFINITY,
      gcTime: Number.POSITIVE_INFINITY,
    },
  });
}
