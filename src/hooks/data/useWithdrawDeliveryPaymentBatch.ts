import { useWriteContract, usePublicClient, useWalletClient } from "wagmi";
import { getContract, encodeFunctionData } from "viem";
import { multicall3Abi } from "contracts-js/dist/abi/abi";
import { FuturesABI } from "../../abi/Futures";
import { chain } from "../../config/chains";

interface WithdrawDeliveryPaymentBatchProps {
  deliveryDates: bigint[];
}

export function useWithdrawDeliveryPaymentBatch() {
  const { writeContractAsync, isPending, isError, error, data: hash } = useWriteContract();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const withdrawDeliveryPaymentBatchAsync = async (props: WithdrawDeliveryPaymentBatchProps) => {
    if (!writeContractAsync || !publicClient || !walletClient) return;
    const multicallAddress = process.env.REACT_APP_MULTICALL_ADDRESS || chain.contracts?.multicall3?.address;
    if (!multicallAddress) {
      throw new Error("Multicall address not found");
    }

    const futuresContractAddress = process.env.REACT_APP_FUTURES_TOKEN_ADDRESS as `0x${string}`;
    if (!futuresContractAddress) {
      throw new Error("Futures contract address not found");
    }

    const multicall = getContract({
      address: multicallAddress,
      abi: multicall3Abi,
      client: publicClient,
    });

    const calldata = props.deliveryDates.map(
      (deliveryDate) =>
        ({
          target: futuresContractAddress,
          allowFailure: false,
          callData: encodeFunctionData({
            abi: FuturesABI,
            functionName: "withdrawDeliveryPayment",
            args: [deliveryDate],
          }),
        }) as const,
    );

    const req = await multicall.simulate.aggregate3([calldata], {
      account: walletClient.account.address,
    });

    return writeContractAsync(req.request);
  };

  return {
    withdrawDeliveryPaymentBatchAsync,
    isPending,
    isError,
    error,
    hash,
  };
}
