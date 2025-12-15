import { useReadContract } from "wagmi";
import { FuturesABI } from "../../abi/Futures";

export function useGetFutureBalance(address: `0x${string}` | undefined) {
  return useReadContract({
    address: process.env.REACT_APP_FUTURES_TOKEN_ADDRESS,
    abi: FuturesABI,
    functionName: "balanceOf",
    args: [address!],
  });
}
