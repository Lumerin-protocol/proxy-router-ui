import { useWriteContract, usePublicClient, useWalletClient } from "wagmi";
import { getContract } from "viem";
import { implementationAbi } from "contracts-js/dist/abi/abi";

interface EditContractDestinationProps {
  contractAddress: string;
  encrValidatorURL: string;
  encrDestURL: string;
}

export function useEditContractDestination() {
  const { writeContractAsync, isPending, isError, error, data: hash } = useWriteContract();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const editContractDestinationAsync = async (props: EditContractDestinationProps) => {
    if (!writeContractAsync || !publicClient || !walletClient) return;

    const impl = getContract({
      address: props.contractAddress as `0x${string}`,
      abi: implementationAbi,
      client: publicClient,
    });

    const req = await impl.simulate.setDestination([props.encrValidatorURL, props.encrDestURL], {
      account: walletClient.account.address,
    });

    return writeContractAsync(req.request);
  };

  return {
    editContractDestinationAsync,
    isPending,
    isError,
    error,
    hash,
  };
}
