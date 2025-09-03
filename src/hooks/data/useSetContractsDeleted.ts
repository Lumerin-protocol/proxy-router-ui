import { useWriteContract, usePublicClient, useWalletClient } from "wagmi";
import { getContract } from "viem";
import { cloneFactoryAbi } from "contracts-js/dist/abi/abi";

interface SetContractsDeletedProps {
  contractAddresses: `0x${string}`[];
  isDeleted: boolean;
}

export function useSetContractsDeleted() {
  const { writeContractAsync, isPending, isError, error, data: hash } = useWriteContract();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const setContractsDeletedAsync = async (props: SetContractsDeletedProps) => {
    if (!writeContractAsync || !publicClient || !walletClient) return;

    const cloneFactory = getContract({
      address: process.env.REACT_APP_CLONE_FACTORY as `0x${string}`,
      abi: cloneFactoryAbi,
      client: publicClient,
    });

    const req = await cloneFactory.simulate.setContractsDeleted([props.contractAddresses, props.isDeleted], {
      account: walletClient.account.address,
    });

    return writeContractAsync(req.request);
  };

  return {
    setContractsDeletedAsync,
    isPending,
    isError,
    error,
    hash,
  };
}
