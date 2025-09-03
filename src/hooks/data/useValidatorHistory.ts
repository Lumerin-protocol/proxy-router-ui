import { useQuery } from "@tanstack/react-query";
import { getValidatorHistory } from "../../gateway/indexer";

export function useValidatorHistory(props: { address: `0x${string}` }) {
  const query = useQuery({
    queryKey: ["validator-history", props.address],
    queryFn: async () => {
      return getValidatorHistory(props.address);
    },
  });

  return {
    ...query,
    data: query.data?.data,
    blockNumber: query.data?.blockNumber,
  };
}
