import { useBalance } from "wagmi";
import { backgroundRefetchOpts } from "./config";

export function useEthBalance(props: { address?: string }) {
  return useBalance({
    address: props.address as `0x${string}`,
    query: {
      ...backgroundRefetchOpts,
      enabled: !!props.address,
    },
  });
}
