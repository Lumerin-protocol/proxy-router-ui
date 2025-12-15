import { useWriteContract, usePublicClient, useWalletClient } from "wagmi";
import { getContract } from "viem";
import { FuturesABI } from "../../abi/Futures";
import { useApproveERC20 } from "./useApproveERC20";
import { useFuturePaymentToken } from "./useFuturePaymentToken";

interface AddMarginProps {
  amount: bigint;
}

export function useApproveAddMargin() {
  const { data: tokenAddress } = useFuturePaymentToken();

  return useApproveERC20(tokenAddress!);
}

export function useAddMargin() {
  const { writeContractAsync, isPending, isError, error, data: hash } = useWriteContract();
  const { data: walletClient } = useWalletClient();

  const addMarginAsync = async (props: AddMarginProps) => {
    if (!writeContractAsync || !walletClient) return;

    const futuresContract = getContract({
      address: process.env.REACT_APP_FUTURES_TOKEN_ADDRESS as `0x${string}`,
      abi: FuturesABI,
      client: walletClient,
    });

    const req = await futuresContract.simulate.addMargin([props.amount], { account: walletClient.account.address });

    return writeContractAsync(req.request);
  };

  return {
    addMarginAsync,
    isPending,
    isError,
    error,
    hash,
  };
}
