import { useWriteContract, usePublicClient, useWalletClient } from "wagmi";
import { getContract } from "viem";
import { cloneFactoryAbi } from "../../abi/CloneFactory";

interface PurchaseContractV2Props {
  contractAddress: string;
  validatorAddress: string;
  encrValidatorURL: string;
  encrDestURL: string;
  termsVersion: string;
  isResellable: boolean;
  resellToDefaultBuyer: boolean;
  resellPrice: bigint;
}

export function usePurchaseContractV2() {
  const { writeContractAsync, isPending, isError, error, data: hash } = useWriteContract();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const purchaseContractV2Async = async (props: PurchaseContractV2Props) => {
    if (!writeContractAsync || !publicClient || !walletClient) return;

    const cloneFactory = getContract({
      address: process.env.REACT_APP_CLONE_FACTORY as `0x${string}`,
      abi: cloneFactoryAbi,
      client: walletClient,
    });

    const req = await cloneFactory.simulate.setPurchaseRentalContractV2(
      [
        props.contractAddress as `0x${string}`,
        props.validatorAddress as `0x${string}`,
        props.encrValidatorURL,
        props.encrDestURL,
        Number(props.termsVersion),
        props.isResellable,
        props.resellToDefaultBuyer,
        props.isResellable ? props.resellPrice : 0n,
      ],
      { account: walletClient.account.address },
    );

    return writeContractAsync(req.request);
  };

  return {
    purchaseContractV2Async,
    isPending,
    isError,
    error,
    hash,
  };
}
