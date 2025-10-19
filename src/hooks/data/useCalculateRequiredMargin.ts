import { useReadContract } from "wagmi";
import { FuturesABI } from "../../abi/Futures";
import { backgroundRefetchOpts } from "./config";

export interface CalculateRequiredMarginProps {
  quantity: bigint;
  isBuy: boolean;
}

export const useCalculateRequiredMargin = (props: CalculateRequiredMarginProps | undefined) => {
  return useReadContract({
    address: process.env.REACT_APP_FUTURES_TOKEN_ADDRESS as `0x${string}`,
    abi: FuturesABI,
    functionName: "calculateRequiredMargin",
    args: props ? [props.quantity, props.isBuy] : undefined,
    query: {
      ...backgroundRefetchOpts,
      enabled: !!props,
    },
  });
};
