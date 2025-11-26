import { backgroundRefetchOpts } from "./config";
import { gql } from "graphql-request";
import { graphqlRequest } from "./graphql";
import { QueryClient, useQuery } from "@tanstack/react-query";
import type { GetResponse } from "../../gateway/interfaces";
import { PositionsBookQuery } from "./graphql-queries";

export const POSITION_BOOK_QK = "PositionBook";

export const usePositionBook = (address: `0x${string}` | undefined, props?: { refetch?: boolean }) => {
  const query = useQuery({
    queryKey: [POSITION_BOOK_QK],
    queryFn: () => fetchPositionBookAsync(address!),
    enabled: !!address,
    ...(props?.refetch ? backgroundRefetchOpts : {}),
  });

  return query;
};

const fetchPositionBookAsync = async (address: `0x${string}`) => {
  const now = Math.floor(Date.now() / 1000);
  const variables = {
    address: address,
    now: now,
  };

  const response = await graphqlRequest<PositionBookResponse>(PositionsBookQuery, variables);

  const data: PositionBook = {
    positions: response.positions.map((position) => ({
      transactionHash: position.transactionHash,
      timestamp: position.timestamp,
      deliveryAt: position.deliveryAt,
      sellPricePerDay: BigInt(position.sellPricePerDay),
      buyPricePerDay: BigInt(position.buyPricePerDay),
      isActive: position.isActive,
      destURL: position.destURL,
      id: position.id,
      closedBy: position.closedBy,
      closedAt: position.closedAt,
      isPaid: position.isPaid,
      buyer: {
        address: position.buyer.address,
      },
      seller: {
        address: position.seller.address,
      },
    })),
  };

  return {
    data,
    blockNumber: response._meta.block.number,
  };
};

export const waitForBlockNumberPositionBook = async (blockNumber: bigint, qc: QueryClient) => {
  const delay = 1000;
  const maxAttempts = 30; // 30 attempts with 1s delay = max 30 seconds wait

  let attempts = 0;
  while (attempts < maxAttempts) {
    await new Promise((resolve) => setTimeout(resolve, delay));
    // Force a fresh fetch of the data
    await qc.refetchQueries({ queryKey: [POSITION_BOOK_QK] });

    const data = qc.getQueryData<GetResponse<PositionBook>>([POSITION_BOOK_QK]);
    const currentBlock = data?.blockNumber;

    if (currentBlock !== undefined && currentBlock >= Number(blockNumber)) {
      return;
    }
    attempts++;
  }

  throw new Error(`Timeout waiting for block number ${blockNumber}`);
};

export type PositionBook = {
  positions: PositionBookPosition[];
};

export type PositionBookPosition = {
  transactionHash: `0x${string}`;
  timestamp: string;
  deliveryAt: string;
  sellPricePerDay: bigint;
  buyPricePerDay: bigint;
  isActive: boolean;
  id: string;
  closedBy: string | null;
  destURL: string;
  closedAt: string | null;
  isPaid: boolean;
  buyer: {
    address: `0x${string}`;
  };
  seller: {
    address: `0x${string}`;
  };
};

type PositionBookResponse = {
  _meta: {
    block: {
      number: number;
      timestamp: string;
    };
  };
  positions: {
    transactionHash: `0x${string}`;
    timestamp: string;
    deliveryAt: string;
    sellPricePerDay: string;
    buyPricePerDay: string;
    isActive: boolean;
    id: string;
    destURL: string;
    closedBy: string | null;
    closedAt: string | null;
    isPaid: boolean;
    buyer: {
      address: `0x${string}`;
    };
    seller: {
      address: `0x${string}`;
    };
  }[];
};
