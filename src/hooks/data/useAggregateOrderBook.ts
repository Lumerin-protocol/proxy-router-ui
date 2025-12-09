import { graphqlRequest } from "./graphql";
import { QueryClient, useQuery } from "@tanstack/react-query";
import type { GetResponse } from "../../gateway/interfaces";
import { AggregateOrderBookQuery } from "./graphql-queries";

export const AGGREGATE_ORDER_BOOK_QK = "AggregateOrderBook";

export const useAggregateOrderBook = (
  deliveryDate: number | undefined,
  props?: { refetch?: boolean; interval?: number },
) => {
  const query = useQuery({
    queryKey: [AGGREGATE_ORDER_BOOK_QK, deliveryDate],
    queryFn: () => fetchAggregateOrderBookAsync(deliveryDate!),
    enabled: !!deliveryDate,
    refetchInterval: props?.interval ?? 10000,
    refetchIntervalInBackground: true,
  });

  return query;
};

const fetchAggregateOrderBookAsync = async (deliveryDate: number) => {
  const variables = {
    deliveryAt: deliveryDate,
  };

  const response = await graphqlRequest<AggregateOrderBookResponse>(AggregateOrderBookQuery, variables);

  const orders = response.deliveryDateOrders.map((order) => ({
    id: order.id,
    price: BigInt(order.price),
    deliveryDate: BigInt(order.deliveryDate),
    buyOrdersCount: order.buyOrdersCount,
    sellOrdersCount: order.sellOrdersCount,
  }));

  const data: AggregateOrderBook = { orders };

  return {
    data,
    blockNumber: response._meta.block.number,
  };
};

export const waitForAggregateBlockNumber = async (blockNumber: bigint, qc: QueryClient, deliveryDate?: number) => {
  const delay = 1000;
  const maxAttempts = 30; // 30 attempts with 1s delay = max 30 seconds wait

  let attempts = 0;
  while (attempts < maxAttempts) {
    await new Promise((resolve) => setTimeout(resolve, delay));
    // Force a fresh fetch of the data
    await qc.refetchQueries({ queryKey: [AGGREGATE_ORDER_BOOK_QK, deliveryDate] });

    const data = qc.getQueryData<GetResponse<AggregateOrderBook>>([AGGREGATE_ORDER_BOOK_QK, deliveryDate]);
    const currentBlock = data?.blockNumber;

    if (currentBlock !== undefined && currentBlock >= Number(blockNumber)) {
      return;
    }
    attempts++;
  }

  throw new Error(`Timeout waiting for block number ${blockNumber}`);
};

export type AggregateOrderBook = {
  orders: AggregateOrderBookOrder[];
};

export type AggregateOrderBookOrder = {
  id: string;
  price: bigint;
  deliveryDate: bigint;
  buyOrdersCount: number;
  sellOrdersCount: number;
};

type AggregateOrderBookResponse = {
  _meta: {
    block: {
      number: number;
      timestamp: string;
    };
  };
  deliveryDateOrders: {
    id: string;
    price: string;
    deliveryDate: string;
    buyOrdersCount: number;
    sellOrdersCount: number;
  }[];
};
