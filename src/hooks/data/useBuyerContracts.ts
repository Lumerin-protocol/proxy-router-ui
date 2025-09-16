import { backgroundRefetchOpts } from "./config";
import { gql } from "graphql-request";
import { graphqlRequest } from "./graphql";
import { type QueryClient, useQuery } from "@tanstack/react-query";
import type { GetResponse } from "../../gateway/interfaces";

export const BUYER_CONTRACTS_QK = "buyerContracts";

export const useBuyerContracts = (props?: {
  refetch?: boolean;
  address: `0x${string}`;
  filter?: "running" | "completed" | "all";
}) => {
  const query = useQuery({
    queryKey: [BUYER_CONTRACTS_QK, props?.address, props?.filter],
    queryFn: () => fetchContractsAsync(props?.address || "0x0", props?.filter || "all"),
    enabled: !!props?.address,
    ...(props?.refetch ? backgroundRefetchOpts : {}),
  });

  return query;
};

const fetchContractsAsync = async (
  address: `0x${string}`,
  filter: "running" | "completed" | "all"
): Promise<GetResponse<AvailableContract[]>> => {
  const now = Math.floor(Date.now() / 1000).toString();

  let filterObj: Record<string, string> = {};
  if (filter === "running") {
    filterObj = { endTime_lt: now };
  } else if (filter === "completed") {
    filterObj = { endTime_gte: now };
  }

  const response = await graphqlRequest<ContractsResponse>(query, { filter: filterObj, address });
  const data = response.buyer.purchases.map(mapContract);
  return {
    data,
    blockNumber: response._meta.block.number,
  };
};

function mapContract(e: ContractsResponse["buyer"]["purchases"][number]): AvailableContract {
  const { id, fee, price, resellProfitTarget, startTime, seller, validator, isResell } = e;

  return {
    _id: id,
    address: validator.address as `0x${string}`, // Using validator address as contract address
    speed: BigInt(0), // Not available in purchase data
    length: BigInt(0), // Not available in purchase data
    profitTargetPercent: resellProfitTarget,
    owner: seller.address as `0x${string}`,
    version: 1, // Default version
    resellChain: [
      {
        account: validator.address as `0x${string}`,
        validator: validator.address as `0x${string}`,
        price: BigInt(price),
        fee: BigInt(fee),
        startTime: BigInt(startTime),
        lastSettlementTime: BigInt(startTime), // Using startTime as fallback
        seller: seller.address as `0x${string}`,
        resellProfitTarget: resellProfitTarget,
        isResellable: isResell,
        isResellToDefaultBuyer: false, // Default value
      },
    ],
    stats: {
      purchasesCount: 1, // Single purchase
      resellsCount: isResell ? 1 : 0,
      earlyCloseoutsCount: 0, // Not available in purchase data
    },
  };
}

const query = gql`
  query GetBuyerContracts($address: ID!, $filter: Purchase_filter!) {
    buyer(id: $address) {
      hashesPurchased
      hashesResold
      hashratePurchased
      hashrateResold
      purchaseCount
      resellCount
      earlyCloseoutCount
      purchases(where: $filter) {
        fee
        id
        isResell
        price
        resellProfitTarget
        startTime
        seller {
          address
        }
        validator {
          address
        }
      }
    }
    _meta {
      block {
        number
        timestamp
      }
    }
  }
`;

export type AvailableContract = {
  _id: string;
  address: `0x${string}`;
  speed: bigint;
  length: bigint;
  profitTargetPercent: number;
  version: number;
  owner: `0x${string}`;
  resellChain: {
    account: `0x${string}`;
    validator: `0x${string}`;
    price: bigint;
    fee: bigint;
    startTime: bigint;
    lastSettlementTime: bigint;
    seller: `0x${string}`;
    resellProfitTarget: number;
    isResellable: boolean;
    isResellToDefaultBuyer: boolean;
  }[];
  stats: {
    purchasesCount: number;
    resellsCount: number;
    earlyCloseoutsCount: number;
  };
};

type ContractsResponse = {
  _meta: {
    block: {
      number: number;
      timestamp: string;
    };
  };
  buyer: {
    hashesPurchased: string;
    hashesResold: string;
    hashratePurchased: string;
    hashrateResold: string;
    purchaseCount: number;
    resellCount: number;
    earlyCloseoutCount: number;
    purchases: {
      fee: string;
      id: string;
      isResell: boolean;
      price: string;
      resellProfitTarget: number;
      startTime: string;
      seller: {
        address: string;
      };
      validator: {
        address: string;
      };
    }[];
  };
};

/** Polls the indexer for new contracts until the block number is reached. Should be used to make sure mutations are reflected in the indexer cache. */
export const waitForBlockNumber = async (blockNumber: bigint, qc: QueryClient) => {
  const delay = 1000;
  const maxAttempts = 30; // 30 attempts with 2s delay = max 1 minute wait

  let attempts = 0;
  while (attempts < maxAttempts) {
    await new Promise((resolve) => setTimeout(resolve, delay));
    // Force a fresh fetch of the data
    await qc.refetchQueries({ queryKey: [BUYER_CONTRACTS_QK] });

    const data = qc.getQueryData<GetResponse<AvailableContract[]>>([BUYER_CONTRACTS_QK]);
    const currentBlock = data?.blockNumber;

    if (currentBlock !== undefined && currentBlock >= Number(blockNumber)) {
      return;
    }
    // Wait 2 seconds before next attempt
    attempts++;
  }

  throw new Error(`Timeout waiting for block number ${blockNumber}`);
};
