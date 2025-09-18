import { useReadContract, useReadContracts } from "wagmi";
import { cloneFactoryAbi } from "../../abi/CloneFactory";
import { hashrateOracleAbi } from "../../abi/HashrateOracle";

export function useValidatorsConst() {
  const { data, isLoading, isError, isSuccess } = useReadContracts({
    contracts: [
      {
        address: process.env.REACT_APP_CLONE_FACTORY as `0x${string}`,
        abi: cloneFactoryAbi,
        functionName: "VALIDATOR_FEE_DECIMALS",
      },
      {
        address: process.env.REACT_APP_CLONE_FACTORY as `0x${string}`,
        abi: cloneFactoryAbi,
        functionName: "validatorFeeRateScaled",
      },
    ],
  });

  return {
    VALIDATOR_FEE_DECIMALS: data?.[0]?.result,
    validatorFeeRateScaled: data?.[1]?.result,
    isLoading,
    isError,
    isSuccess,
  };
}

export function useHashrateForOracle() {
  // can be cashed for 1-2 minutes, try react-query
  const addressResult = useGetOracleAddress();

  return useReadContract({
    address: addressResult.data,
    abi: hashrateOracleAbi,
    functionName: "getHashesforToken",
    query: {
      enabled: !!addressResult.isSuccess,
    },
  });
}

function useGetOracleAddress() {
  return useReadContract({
    address: process.env.REACT_APP_CLONE_FACTORY,
    abi: cloneFactoryAbi,
    functionName: "hashrateOracle",
  });
}
