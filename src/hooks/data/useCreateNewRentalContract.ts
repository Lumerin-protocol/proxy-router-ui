import { useWriteContract, usePublicClient, useWalletClient } from "wagmi";
import { zeroAddress, getContract } from "viem";
import { cloneFactoryAbi } from "contracts-js/dist/abi/abi";

interface CreateNewRentalContractProps {
  speedHPS: bigint;
  durationSeconds: bigint;
  profitTargetPercent: number;
  publicKey: `0x${string}`;
}

export function useCreateNewRentalContract() {
  const { writeContractAsync, isPending, isError, error, data: hash } = useWriteContract();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const createNewRentalContractAsync = async (props: CreateNewRentalContractProps) => {
    if (!writeContractAsync || !publicClient || !walletClient) return;

    const cloneFactory = getContract({
      address: process.env.REACT_APP_CLONE_FACTORY as `0x${string}`,
      abi: cloneFactoryAbi,
      client: publicClient,
    });

    const req = await cloneFactory.simulate.setCreateNewRentalContractV2(
      [0n, 0n, props.speedHPS, props.durationSeconds, props.profitTargetPercent, zeroAddress, props.publicKey],
      { account: walletClient.account.address },
    );

    return writeContractAsync(req.request);
  };

  return {
    createNewRentalContractAsync,
    isPending,
    isError,
    error,
    hash,
  };
}
