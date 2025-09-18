import { backgroundRefetchOpts } from "./config";
import { gql } from "graphql-request";
import { graphqlRequest } from "./graphql";
import { type QueryClient, useQuery } from "@tanstack/react-query";
import type { GetResponse } from "../../gateway/interfaces";

export const CONTRACTS_AGGREGATION_QK = "contractsAggregation";

export const useContactsAggregation = (props?: { refetch?: boolean }) => {
  const query = useQuery({
    queryKey: [CONTRACTS_AGGREGATION_QK],
    queryFn: fetchAggregationAsync,
    ...(props?.refetch ? backgroundRefetchOpts : {}),
  });

  return query;
};

const fetchAggregationAsync = async (): Promise<GetResponse<ContractsAggregation>> => {
  const response = await graphqlRequest<AggregationResponse>(query);
  const data = mapAggregation(response.cloneFactory);
  return {
    data,
    blockNumber: response._meta.block.number,
  };
};

function mapAggregation(cloneFactory: AggregationResponse["cloneFactory"]): ContractsAggregation {
  return {
    contractAvailableResellableCount: cloneFactory.contractAvailableResellableCount,
    contractAvailableCount: cloneFactory.contractAvailableCount,
  };
}

const query = gql`
  query MyQuery {
    cloneFactory(id: "0") {
      contractAvailableResellableCount
      contractAvailableCount
    }
    _meta {
      block {
        number
        timestamp
      }
    }
  }
`;

export type ContractsAggregation = {
  contractAvailableResellableCount: number;
  contractAvailableCount: number;
};

type AggregationResponse = {
  _meta: {
    block: {
      number: number;
      timestamp: string;
    };
  };
  cloneFactory: {
    contractAvailableResellableCount: number;
    contractAvailableCount: number;
  };
};

/** Polls the indexer for new aggregation data until the block number is reached. Should be used to make sure mutations are reflected in the indexer cache. */
export const waitForAggregationBlockNumber = async (blockNumber: bigint, qc: QueryClient) => {
  const delay = 1000;
  const maxAttempts = 30; // 30 attempts with 2s delay = max 1 minute wait

  let attempts = 0;
  while (attempts < maxAttempts) {
    await new Promise((resolve) => setTimeout(resolve, delay));
    // Force a fresh fetch of the data
    await qc.refetchQueries({ queryKey: [CONTRACTS_AGGREGATION_QK] });

    const data = qc.getQueryData<GetResponse<ContractsAggregation>>([CONTRACTS_AGGREGATION_QK]);
    const currentBlock = data?.blockNumber;

    if (currentBlock !== undefined && currentBlock >= Number(blockNumber)) {
      return;
    }
    // Wait 2 seconds before next attempt
    attempts++;
  }

  throw new Error(`Timeout waiting for block number ${blockNumber}`);
};
