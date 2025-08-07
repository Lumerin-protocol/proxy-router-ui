import { useWriteContract, usePublicClient, useWalletClient } from "wagmi";
import { erc20Abi, getContract } from "viem";
import { useCallback } from "react";

interface ApproveProps {
  spender: `0x${string}`;
  amount: bigint;
}

export function useApproveERC20(tokenAddress: `0x${string}`) {
  const { writeContractAsync, ...rest } = useWriteContract();
  const pc = usePublicClient();
  const { data: wc } = useWalletClient();

  const approveAsync = useCallback(
    async (props: ApproveProps) => {
      if (!writeContractAsync || !pc || !wc) return;

      const token = getContract({
        address: tokenAddress,
        abi: erc20Abi,
        client: wc,
      });

      // Check current allowance
      const currentAllowance = await token.read.allowance([wc.account.address, props.spender]);

      // If current allowance is sufficient, return undefined
      if (currentAllowance >= props.amount) {
        return undefined;
      }

      const req = await token.simulate.approve([props.spender, props.amount], {
        account: wc.account.address,
      });

      return writeContractAsync(req.request);
    },
    [writeContractAsync, pc, wc, tokenAddress],
  );

  return {
    ...rest,
    approveAsync,
  };
}
