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

  // Generate a random mock order
  const isBuy = Math.random() > 0.5; // Random buy or sell
  // Price around 4 ± 0.05 (between 3.95 and 4.05 USDC) with 0.01 step increments
  // In wei: 4.00 USDC = 4000000n, 0.01 USDC = 10000n
  const basePrice = 4000000n; // 4.00 USDC
  const stepSize = 10000n; // 0.01 USDC per step
  // Random steps between -5 and +5 (covering -0.05 to +0.05 in 0.01 increments)
  const randomSteps = Math.floor(Math.random() * 11) - 5; // Random between -5 and +5
  const priceVariation = BigInt(randomSteps) * stepSize;
  const mockPrice = basePrice + priceVariation; // Between 3950000n (3.95) and 4050000n (4.05) in 0.01 steps

  const mock = {
    id: `mock-order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    pricePerDay: mockPrice,
    deliveryAt: BigInt(deliveryDate),
    participant: {
      address: "0x0000000000000000000000000000000000000000" as `0x${string}`,
    },
    isBuy: isBuy,
    isActive: true,
  };

  var respOrders = response.orders.map((order) => ({
    id: order.id,
    pricePerDay: BigInt(order.pricePerDay),
    deliveryAt: BigInt(order.deliveryAt),
    participant: {
      address: order.participant.address,
    },
    isBuy: order.isBuy,
    isActive: order.isActive,
  }));

  const data: OrderBook = {
    orders: [
      ...respOrders,
      // mock
      // Add mock order
    ],
  };

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
