import { useWriteContract, usePublicClient, useWalletClient } from "wagmi";
import { useFeeTokenAddress } from "./useFeeTokenBalance";
import { getContract } from "viem";
import { usdcMockAbi } from "contracts-js/dist/abi/abi";

interface ApproveFeeProps {
  spender: `0x${string}`;
  amount: bigint;
}

export function useApproveFee() {
  const { writeContractAsync, ...rest } = useWriteContract();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { data: feeTokenAddress } = useFeeTokenAddress();

  const approveFeeAsync = async (props: ApproveFeeProps) => {
    if (!writeContractAsync || !publicClient || !walletClient || !feeTokenAddress) return;

    const token = getContract({
      address: feeTokenAddress,
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
    approveFeeAsync,
  };
}
