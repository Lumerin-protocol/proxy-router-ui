import { useReadContract } from "wagmi";
import { FuturesABI } from "../../abi/Futures";

export function useFuturePaymentToken() {
  return useReadContract({
    address: process.env.REACT_APP_FUTURES_TOKEN_ADDRESS,
    abi: FuturesABI,
    functionName: "token",
  });
}
