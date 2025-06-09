import { useWriteContract, usePublicClient, useWalletClient } from "wagmi";
import { getContract, encodeFunctionData } from "viem";
import { implementationAbi, multicall3Abi } from "contracts-js/dist/abi/abi";
import { chain } from "../../config/chains";

interface ClaimFundsBatchProps {
  contractAddresses: `0x${string}`[];
}

export function useClaimFundsBatch() {
  const { writeContractAsync, isPending, isError, error, data: hash } = useWriteContract();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const claimFundsBatchAsync = async (props: ClaimFundsBatchProps) => {
    if (!writeContractAsync || !publicClient || !walletClient) return;
    const multicallAddress = process.env.REACT_APP_MULTICALL_ADDRESS || chain.contracts?.multicall3?.address;
    if (!multicallAddress) {
      throw new Error("Multicall address not found");
    }

    const multicall = getContract({
      address: multicallAddress,
      abi: multicall3Abi,
      client: publicClient,
    });

    const calldata = props.contractAddresses.map(
      (addr) =>
        ({
          target: addr,
          allowFailure: false,
          callData: encodeFunctionData({
            abi: implementationAbi,
            functionName: "claimFunds",
          }),
        }) as const,
    );

    const req = await multicall.simulate.aggregate3([calldata], {
      account: walletClient.account.address,
    });

    return writeContractAsync(req.request);
  };

  return {
    claimFundsBatchAsync,
    isPending,
    isError,
    error,
    hash,
  };
}
