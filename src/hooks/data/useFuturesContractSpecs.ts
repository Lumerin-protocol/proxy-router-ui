import { backgroundRefetchOpts } from "./config";
import { gql } from "graphql-request";
import { graphqlRequest } from "./graphql";
import { useQuery } from "@tanstack/react-query";
import type { GetResponse } from "../../gateway/interfaces";
import { ContractSpecsQuery } from "./graphql-queries";

export const FUTURES_CONTRACT_SPECS_QK = "ContractSpecs";

export const useFuturesContractSpecs = (props?: { refetch?: boolean }) => {
  const query = useQuery({
    queryKey: [FUTURES_CONTRACT_SPECS_QK],
    queryFn: fetchContractSpecsAsync,
    ...(props?.refetch ? backgroundRefetchOpts : {}),
  });

  return query;
};

const fetchContractSpecsAsync = async (): Promise<GetResponse<FuturesContractSpecs>> => {
  const response = await graphqlRequest<ContractSpecsResponse>(ContractSpecsQuery);
  const data: FuturesContractSpecs = {
    deliveryDurationDays: response.futures.deliveryDurationDays,
    deliveryDurationSeconds: response.futures.deliveryDurationDays * 24 * 60 * 60,
    hashrateOracleAddress: response.futures.hashrateOracleAddress,
    minimumPriceIncrement: BigInt(response.futures.minimumPriceIncrement),
    liquidationMarginPercent: response.futures.liquidationMarginPercent,
    speedHps: BigInt(+response.futures.speedHps),
    tokenAddress: response.futures.tokenAddress,
    validatorAddress: response.futures.validatorAddress,
  };
  return {
    data,
    blockNumber: response._meta.block.number,
  };
};

export type FuturesContractSpecs = {
  deliveryDurationDays: number;
  deliveryDurationSeconds: number;
  hashrateOracleAddress: `0x${string}`;
  minimumPriceIncrement: bigint;
  liquidationMarginPercent: number;
  speedHps: bigint;
  tokenAddress: `0x${string}`;
  validatorAddress: `0x${string}`;
};

type ContractSpecsResponse = {
  _meta: {
    block: {
      number: number;
      timestamp: string;
    };
  };
  futures: {
    liquidationMarginPercent: number;
    deliveryDurationDays: number;
    hashrateOracleAddress: `0x${string}`;
    minimumPriceIncrement: string;
    speedHps: string;
    tokenAddress: `0x${string}`;
    validatorAddress: `0x${string}`;
  };
};
