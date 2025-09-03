import { useQuery } from "@tanstack/react-query";
import { getRate } from "../../gateway/rates/rate";
import { backgroundRefetchOpts } from "./config";

export const RATES_QK = "rates";

export function useRates() {
  return useQuery({
    ...backgroundRefetchOpts,
    queryKey: [RATES_QK],
    queryFn: () => getRate(),
  });
}
