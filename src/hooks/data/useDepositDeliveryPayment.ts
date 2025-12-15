import { useWriteContract } from "wagmi";
import { getContract } from "viem";
import { useWalletClient } from "wagmi";
import { FuturesABI } from "../../abi/Futures";

interface DepositDeliveryPaymentProps {
  positionIds: `0x${string}`[];
}

export function useDepositDeliveryPayment() {
  const { writeContractAsync, isPending, isError, error, data: hash } = useWriteContract();
  const { data: walletClient } = useWalletClient();

  const depositDeliveryPaymentAsync = async (props: DepositDeliveryPaymentProps) => {
    if (!writeContractAsync || !walletClient) return;

    const futuresContract = getContract({
      address: process.env.REACT_APP_FUTURES_TOKEN_ADDRESS as `0x${string}`,
      abi: FuturesABI,
      client: walletClient,
    });

    const req = await futuresContract.simulate.depositDeliveryPayment([props.positionIds], {
      account: walletClient.account.address,
    });

    return writeContractAsync(req.request);
  };

  return {
    depositDeliveryPaymentAsync,
    isPending,
    isError,
    error,
    hash,
  };
}
