import { useWriteContract, usePublicClient, useWalletClient } from "wagmi";
import { getContract } from "viem";
import { implementationAbi } from "contracts-js/dist/abi/abi";

interface CloseContractProps {
  contractAddress: string;
}

export function useCloseContract() {
  const { writeContractAsync, isPending, isError, error, data: hash } = useWriteContract();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const closeContractAsync = async (props: CloseContractProps) => {
    if (!writeContractAsync || !publicClient || !walletClient) return;

    const impl = getContract({
      address: props.contractAddress as `0x${string}`,
      abi: implementationAbi,
      client: publicClient,
    });

    const req = await impl.simulate.closeEarly([0], {
      account: walletClient.account.address,
    });

    return writeContractAsync(req.request);
  };

  return {
    closeContractAsync,
    isPending,
    isError,
    error,
    hash,
  };
}
