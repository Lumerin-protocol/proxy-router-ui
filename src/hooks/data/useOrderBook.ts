import { backgroundRefetchOpts } from "./config";
import { gql } from "graphql-request";
import { graphqlRequest } from "./graphql";
import { QueryClient, useQuery } from "@tanstack/react-query";
import type { GetResponse } from "../../gateway/interfaces";
import { OrderBookQuery } from "./graphql-queries";

export const ORDER_BOOK_QK = "OrderBook";

export const useOrderBook = (deliveryDate: number | undefined, props?: { refetch?: boolean; interval?: number }) => {
  const query = useQuery({
    queryKey: [ORDER_BOOK_QK],
    queryFn: () => fetchOrderBookAsync(deliveryDate!),
    enabled: !!deliveryDate,
    refetchInterval: props?.interval ?? 10000,
    refetchIntervalInBackground: true,
  });

  return query;
};

const fetchOrderBookAsync = async (deliveryDate: number) => {
  const variables = {
    deliveryAt: deliveryDate.toString(),
  };

  const response = await graphqlRequest<OrderBookResponse>(OrderBookQuery, variables);

  var orders = response.orders.map((order) => ({
    id: order.id,
    pricePerDay: BigInt(order.pricePerDay),
    deliveryAt: BigInt(order.deliveryAt),
    participant: {
      address: order.participant.address,
    },
    isBuy: order.isBuy,
    isActive: order.isActive,
  }));

  const data: OrderBook = { orders };

  return {
    data,
    blockNumber: response._meta.block.number,
  };
};

export const waitForBlockNumber = async (blockNumber: bigint, qc: QueryClient) => {
  const delay = 1000;
  const maxAttempts = 30; // 30 attempts with 1s delay = max 30 seconds wait

  let attempts = 0;
  while (attempts < maxAttempts) {
    await new Promise((resolve) => setTimeout(resolve, delay));
    // Force a fresh fetch of the data
    await qc.refetchQueries({ queryKey: [ORDER_BOOK_QK] });

    const data = qc.getQueryData<GetResponse<OrderBookResponse>>([ORDER_BOOK_QK]);
    const currentBlock = data?.blockNumber;

    if (currentBlock !== undefined && currentBlock >= Number(blockNumber)) {
      return;
    }
    attempts++;
  }

  throw new Error(`Timeout waiting for block number ${blockNumber}`);
};

export type OrderBook = {
  orders: OrderBookOrder[];
};

export type OrderBookOrder = {
  id: string;
  pricePerDay: bigint;
  deliveryAt: bigint;
  participant: {
    address: `0x${string}`;
  };
  isBuy: boolean;
};

type OrderBookResponse = {
  _meta: {
    block: {
      number: number;
      timestamp: string;
    };
  };
  orders: {
    id: string;
    pricePerDay: string;
    deliveryAt: string;
    participant: {
      address: `0x${string}`;
    };
    isBuy: boolean;
    isActive: boolean;
  }[];
};
