import { backgroundRefetchOpts } from "./config";
import { gql } from "graphql-request";
import { graphqlRequest } from "./graphql";
import { useQuery } from "@tanstack/react-query";
import type { GetResponse } from "../../gateway/interfaces";

export const FUTURES_CONTRACT_SPECS_QK = "futuresContractSpecs";

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
    buyerLiquidationMarginPercent: response.futures.buyerLiquidationMarginPercent,
    closeoutCount: response.futures.closeoutCount,
    contractActiveCount: response.futures.contractActiveCount,
    contractCount: response.futures.contractCount,
    deliveryDurationSeconds: response.futures.deliveryDurationSeconds,
    hashrateOracleAddress: response.futures.hashrateOracleAddress,
    minSellerStake: BigInt(response.futures.minSellerStake),
    priceLadderStep: BigInt(response.futures.priceLadderStep),
    purchaseCount: response.futures.purchaseCount,
    sellerLiquidationMarginPercent: response.futures.sellerLiquidationMarginPercent,
    speedHps: BigInt(response.futures.speedHps),
    tokenAddress: response.futures.tokenAddress,
    validatorAddress: response.futures.validatorAddress,
  };
  return {
    data,
    blockNumber: response._meta.block.number,
  };
};

const ContractSpecsQuery = gql`
  query ContractSpecs {
    futures(id: "0") {
      buyerLiquidationMarginPercent
      closeoutCount
      contractActiveCount
      contractCount
      deliveryDurationSeconds
      hashrateOracleAddress
      minSellerStake
      priceLadderStep
      purchaseCount
      sellerLiquidationMarginPercent
      speedHps
      tokenAddress
      validatorAddress
    }
    _meta {
      block {
        number
        timestamp
      }
    }
  }
`;

export type FuturesContractSpecs = {
  buyerLiquidationMarginPercent: number;
  closeoutCount: number;
  contractActiveCount: number;
  contractCount: number;
  deliveryDurationSeconds: number;
  hashrateOracleAddress: `0x${string}`;
  minSellerStake: bigint;
  priceLadderStep: bigint;
  purchaseCount: number;
  sellerLiquidationMarginPercent: number;
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
    buyerLiquidationMarginPercent: number;
    closeoutCount: number;
    contractActiveCount: number;
    contractCount: number;
    deliveryDurationSeconds: number;
    hashrateOracleAddress: `0x${string}`;
    minSellerStake: string;
    priceLadderStep: string;
    purchaseCount: number;
    sellerLiquidationMarginPercent: number;
    speedHps: string;
    tokenAddress: `0x${string}`;
    validatorAddress: `0x${string}`;
  };
};
