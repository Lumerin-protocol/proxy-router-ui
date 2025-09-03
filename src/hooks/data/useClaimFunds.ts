import { useWriteContract, usePublicClient, useWalletClient } from "wagmi";
import { getContract } from "viem";
import { implementationAbi } from "contracts-js/dist/abi/abi";

interface ClaimFundsProps {
  contractAddress: string;
}

export function useClaimFunds() {
  const { writeContractAsync, isPending, isError, error, data: hash } = useWriteContract();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const claimFundsAsync = async (props: ClaimFundsProps) => {
    if (!writeContractAsync || !publicClient || !walletClient) return;

    const impl = getContract({
      address: props.contractAddress as `0x${string}`,
      abi: implementationAbi,
      client: publicClient,
    });

    const req = await impl.simulate.claimFunds({
      account: walletClient.account.address,
    });

    return writeContractAsync(req.request);
  };

  return {
    claimFundsAsync,
    isPending,
    isError,
    error,
    hash,
  };
}
