import { useWriteContract, usePublicClient, useWalletClient } from "wagmi";
import { getContract } from "viem";
import { FuturesABI } from "../../abi/Futures";

interface AddMarginProps {
  amount: bigint;
}

export function useAddMargin() {
  const { writeContractAsync, isPending, isError, error, data: hash } = useWriteContract();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const addMarginAsync = async (props: AddMarginProps) => {
    if (!writeContractAsync || !publicClient || !walletClient) return;

    const futuresContract = getContract({
      address: process.env.REACT_APP_FUTURES_TOKEN_ADDRESS as `0x${string}`,
      abi: FuturesABI,
      client: publicClient,
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
