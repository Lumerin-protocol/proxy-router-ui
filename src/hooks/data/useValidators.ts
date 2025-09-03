import { validatorRegistryAbi } from "contracts-js/dist/abi/abi";
import { useReadContract, useReadContracts } from "wagmi";

type Props = {
  offset: number;
  limit: number;
};

export const useValidators = ({ offset, limit }: Props) => {
  const activeValidatorsQuery = useReadContract({
    address: process.env.REACT_APP_VALIDATOR_REGISTRY_ADDRESS,
    abi: validatorRegistryAbi,
    functionName: "getActiveValidators",
    args: [BigInt(offset), limit],
    query: {
      refetchInterval: false,
    },
  });

  const validatorsQuery = useReadContracts({
    allowFailure: false,
    contracts: activeValidatorsQuery.data?.map(
      (addr) =>
        ({
          address: process.env.REACT_APP_VALIDATOR_REGISTRY_ADDRESS,
          abi: validatorRegistryAbi,
          functionName: "getValidator",
          args: [addr],
        }) as const,
    ),
    query: {
      enabled: activeValidatorsQuery.isSuccess,
      refetchInterval: false,
    },
  });

  return {
    isLoading: activeValidatorsQuery.isLoading || validatorsQuery.isLoading,
    error: activeValidatorsQuery.error || validatorsQuery.error,
    data: validatorsQuery.data,
  };
};
