import { useWriteContract, usePublicClient, useWalletClient } from "wagmi";
import { encodeFunctionData, getContract } from "viem";
import { FuturesABI } from "../../abi/Futures";

interface ModifyOrderProps {
  oldPrice: bigint;
  oldQuantity: number; // Current quantity (positive for Buy, negative for Sell)
  newPrice: bigint;
  newQuantity: number; // New quantity (positive for Buy, negative for Sell)
  destUrl: string;
  deliveryDate: bigint;
}

export function useModifyOrder() {
  const { writeContractAsync, isPending, isError, error, data: hash } = useWriteContract();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const modifyOrderAsync = async (props: ModifyOrderProps) => {
    if (!writeContractAsync || !publicClient || !walletClient) return;

    const futuresContract = getContract({
      address: process.env.REACT_APP_FUTURES_TOKEN_ADDRESS as `0x${string}`,
      abi: FuturesABI,
      client: publicClient,
    });

    // Clamp quantities to int8 range (-128 to 127)
    const clampOldQuantity = Math.max(-128, Math.min(127, props.oldQuantity));
    const clampNewQuantity = Math.max(-128, Math.min(127, props.newQuantity));

    // Create opposite quantity to close the old order
    const oppositeOldQuantity = -clampOldQuantity;

    // Encode the two createOrder calls
    const calldata = [
      encodeFunctionData({
        abi: FuturesABI,
        functionName: "createOrder",
        args: [props.oldPrice, props.deliveryDate, props.destUrl, oppositeOldQuantity],
      }),
      encodeFunctionData({
        abi: FuturesABI,
        functionName: "createOrder",
        args: [props.newPrice, props.deliveryDate, props.destUrl, clampNewQuantity],
      }),
    ];

    // Simulate the multicall transaction
    const req = await futuresContract.simulate.multicall([calldata], {
      account: walletClient.account.address,
    });

    return writeContractAsync(req.request);
  };

  return {
    modifyOrderAsync,
    isPending,
    isError,
    error,
    hash,
  };
}
