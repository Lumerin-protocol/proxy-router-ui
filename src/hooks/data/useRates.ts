import { useQuery } from "@tanstack/react-query";
import { getRate } from "../../gateway/rates/rate";

export function useRates() {
  return useQuery({
    queryKey: ["rates"],
    queryFn: () => getRate(),
    refetchInterval: 1000 * 60 * 5,
    staleTime: 1000 * 60 * 5,
  });
}
