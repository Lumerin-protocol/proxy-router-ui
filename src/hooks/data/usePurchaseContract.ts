import { useWriteContract, usePublicClient, useWalletClient } from "wagmi";
import { getContract } from "viem";
import { cloneFactoryAbi } from "contracts-js/dist/abi/abi";

interface PurchaseContractProps {
  contractAddress: string;
  validatorAddress: string;
  encrValidatorURL: string;
  encrDestURL: string;
  termsVersion: string;
}

export function usePurchaseContract() {
  const { writeContractAsync, isPending, isError, error, data: hash } = useWriteContract();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const purchaseContractAsync = async (props: PurchaseContractProps) => {
    if (!writeContractAsync || !publicClient || !walletClient) return;

    const cloneFactory = getContract({
      address: process.env.REACT_APP_CLONE_FACTORY as `0x${string}`,
      abi: cloneFactoryAbi,
      client: publicClient,
    });

    const req = await cloneFactory.simulate.setPurchaseRentalContractV2(
      [
        props.contractAddress as `0x${string}`,
        props.validatorAddress as `0x${string}`,
        props.encrValidatorURL,
        props.encrDestURL,
        Number(props.termsVersion),
      ],
      { account: walletClient.account.address },
    );

    return writeContractAsync(req.request);
  };

  return {
    purchaseContractAsync,
    isPending,
    isError,
    error,
    hash,
  };
}
