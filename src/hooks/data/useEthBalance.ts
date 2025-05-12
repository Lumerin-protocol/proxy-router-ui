import { useBalance } from "wagmi";

export function useEthBalance(address?: string) {
  const { data, isLoading, error } = useBalance({
    address: address as `0x${string}`,
    query: {
      enabled: !!address,
    },
  });

  return {
    balance: data?.value,
    isLoading,
    error,
  };
}
