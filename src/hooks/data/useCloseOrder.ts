import { useWriteContract, usePublicClient, useWalletClient } from "wagmi";
import { getContract } from "viem";
import { FuturesABI } from "../../abi/Futures";

interface CloseOrdersProps {
  orderIds: `0x${string}`[];
}

export function useCloseOrder() {
  const { writeContractAsync, isPending, isError, error, data: hash } = useWriteContract();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const closeOrdersAsync = async (props: CloseOrdersProps) => {
    if (!writeContractAsync || !publicClient || !walletClient) return;

    const futuresContract = getContract({
      address: process.env.REACT_APP_FUTURES_TOKEN_ADDRESS as `0x${string}`,
      abi: FuturesABI,
      client: publicClient,
    });

    const receipts: unknown[] = [];
    for (const orderId of props.orderIds) {
      const req = await futuresContract.simulate.closeOrder([orderId], {
        account: walletClient.account.address,
      });

      // Execute each close sequentially to avoid nonce conflicts
      const tx = await writeContractAsync(req.request);
      receipts.push(tx);
    }

    return receipts;
  };

  return {
    closeOrdersAsync,
    isPending,
    isError,
    error,
    hash,
  };
}
