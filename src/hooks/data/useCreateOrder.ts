import { useWriteContract, usePublicClient, useWalletClient } from "wagmi";
import { getContract } from "viem";
import { FuturesABI } from "../../abi/Futures";

interface CreateOrderProps {
  price: bigint;
  quantity: number; // Positive for Buy, Negative for Sell
  destUrl: string;
  deliveryDate: bigint;
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

    // Convert quantity to int8 (signed 8-bit integer)
    // Contract expects: positive = Buy, negative = Sell
    const quantityInt8 = Number(props.quantity) as number;

    // Clamp to int8 range (-128 to 127)
    const clampedQuantity = Math.max(-128, Math.min(127, quantityInt8));

    const req = await futuresContract.simulate.createOrder(
      [props.price, props.deliveryDate, props.destUrl, clampedQuantity],
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
