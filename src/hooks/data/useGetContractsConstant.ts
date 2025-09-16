import { useReadContract } from "wagmi";
import { cloneFactoryAbi } from "../../abi/CloneFactory";
import { hashrateOracleAbi } from "../../abi/HashrateOracle";

export function useValidatorsConst() {
  const { data: VALIDATOR_FEE_DECIMALS } = useReadContract({
    address: process.env.REACT_APP_CLONE_FACTORY,
    abi: cloneFactoryAbi,
    functionName: "VALIDATOR_FEE_DECIMALS",
  });
  const { data: validatorFeeRateScaled } = useReadContract({
    address: process.env.REACT_APP_CLONE_FACTORY,
    abi: cloneFactoryAbi,
    functionName: "validatorFeeRateScaled",
  });
  return { VALIDATOR_FEE_DECIMALS, validatorFeeRateScaled };
}

export function useHashrateForOracle() {
  // can be cashed for 1-2 minutes, try react-query
  const { data: oracleAddress } = useGetOracleAddress();

  return useReadContract({
    address: oracleAddress,
    abi: hashrateOracleAbi,
    functionName: "getHashesforToken",
  });
}

function useGetOracleAddress() {
  return useReadContract({
    address: process.env.REACT_APP_CLONE_FACTORY,
    abi: cloneFactoryAbi,
    functionName: "hashrateOracle",
  });
}
