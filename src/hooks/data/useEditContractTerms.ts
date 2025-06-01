import { useWriteContract, usePublicClient, useWalletClient } from "wagmi";
import { getContract } from "viem";
import { cloneFactoryAbi } from "contracts-js/dist/abi/abi";

interface EditContractTermsProps {
  contractAddress: string;
  speedHPS: bigint;
  durationSeconds: bigint;
  profitTargetPercent: bigint;
}

export function useEditContractTerms() {
  const { writeContractAsync, isPending, isError, error, data: hash } = useWriteContract();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const editContractTermsAsync = async (props: EditContractTermsProps) => {
    if (!writeContractAsync || !publicClient || !walletClient) return;

    const cloneFactory = getContract({
      address: process.env.REACT_APP_CLONE_FACTORY as `0x${string}`,
      abi: cloneFactoryAbi,
      client: publicClient,
    });

    const req = await cloneFactory.simulate.setUpdateContractInformationV2(
      [
        props.contractAddress as `0x${string}`,
        0n,
        0n,
        props.speedHPS,
        props.durationSeconds,
        Number(props.profitTargetPercent),
      ],
      { account: walletClient.account.address },
    );

    return writeContractAsync(req.request);
  };

  return {
    editContractTermsAsync,
    isPending,
    isError,
    error,
    hash,
  };
}
