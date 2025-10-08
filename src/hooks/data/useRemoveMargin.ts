import { useWriteContract, usePublicClient, useWalletClient } from "wagmi";
import { getContract } from "viem";
import { FuturesABI } from "../../abi/Futures";

interface RemoveMarginProps {
  amount: bigint;
}

export function useRemoveMargin() {
  const { writeContractAsync, isPending, isError, error, data: hash } = useWriteContract();
  const { data: walletClient } = useWalletClient();

  const removeMarginAsync = async (props: RemoveMarginProps) => {
    if (!writeContractAsync || !walletClient) return;

    const futuresContract = getContract({
      address: process.env.REACT_APP_FUTURES_TOKEN_ADDRESS as `0x${string}`,
      abi: FuturesABI,
      client: walletClient,
    });

    const req = await futuresContract.simulate.removeMargin([props.amount], { account: walletClient.account.address });

    return writeContractAsync(req.request);
  };

  return {
    removeMarginAsync,
    isPending,
    isError,
    error,
    hash,
  };
}
