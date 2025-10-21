import { useWriteContract, usePublicClient, useWalletClient } from "wagmi";
import { getContract } from "viem";
import { FuturesABI } from "../../abi/Futures";

interface CreateOrderProps {
  price: bigint;
  quantity: number;
  deliveryDate: bigint;
  isBuy: boolean;
}

export function useCreateOrder() {
  const { writeContractAsync, isPending, isError, error, data: hash } = useWriteContract();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const createOrderAsync = async (props: CreateOrderProps) => {
    if (!writeContractAsync || !publicClient || !walletClient) return;

    const futuresContract = getContract({
      address: process.env.REACT_APP_FUTURES_TOKEN_ADDRESS as `0x${string}`,
      abi: FuturesABI,
      client: publicClient,
    });

    const req = await futuresContract.simulate.createOrder(
      [props.price, props.deliveryDate, props.quantity, props.isBuy],
      { account: walletClient.account.address },
    );

    return writeContractAsync(req.request);
  };

  return {
    createOrderAsync,
    isPending,
    isError,
    error,
    hash,
  };
}
