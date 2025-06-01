import { useWriteContract, usePublicClient, useWalletClient } from "wagmi";
import { usePaymentTokenAddress } from "./usePaymentTokenBalance";
import { getContract } from "viem";
import { usdcMockAbi } from "contracts-js/dist/abi/abi";

interface ApprovePaymentProps {
  spender: `0x${string}`;
  amount: bigint;
}

export function useApprovePayment() {
  const { writeContractAsync, ...rest } = useWriteContract();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { data: paymentTokenAddress } = usePaymentTokenAddress();

  const approvePaymentAsync = async (props: ApprovePaymentProps) => {
    if (!writeContractAsync || !publicClient || !walletClient || !paymentTokenAddress) return;

    const token = getContract({
      address: paymentTokenAddress,
      abi: usdcMockAbi,
      client: publicClient,
    });

    // Check current allowance
    const currentAllowance = await token.read.allowance([walletClient.account.address, props.spender]);

    // If current allowance is sufficient, return undefined
    if (currentAllowance >= props.amount) {
      return undefined;
    }

    const req = await token.simulate.approve([props.spender, props.amount], {
      account: walletClient.account.address,
    });

    return writeContractAsync(req.request);
  };

  return {
    ...rest,
    approvePaymentAsync,
  };
}
