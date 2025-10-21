import { backgroundRefetchOpts } from "./config";
import { gql } from "graphql-request";
import { graphqlRequest } from "./graphql";
import { useQuery } from "@tanstack/react-query";
import type { GetResponse } from "../../gateway/interfaces";
import { OrderBookQuery } from "./graphql-queries";

export const ORDER_BOOK_QK = "OrderBook";

export const useOrderBook = (deliveryDate: number | undefined, props?: { refetch?: boolean }) => {
  const query = useQuery({
    queryKey: [ORDER_BOOK_QK, deliveryDate],
    queryFn: () => fetchOrderBookAsync(deliveryDate!),
    enabled: !!deliveryDate,
    ...(props?.refetch ? backgroundRefetchOpts : {}),
  });

  return query;
};

const fetchOrderBookAsync = async (deliveryDate: number) => {
  const variables = {
    deliveryDate: deliveryDate.toString(),
  };

  const response = await graphqlRequest<OrderBookResponse>(OrderBookQuery, variables);

  const data: OrderBook = {
    orders: response.orders.map((order) => ({
      id: order.id,
      price: BigInt(order.price),
      deliveryDate: BigInt(order.deliveryDate),
      participant: {
        address: order.participant.address,
      },
      isBuy: order.isBuy,
      isActive: order.isActive,
    })),
  };

  return {
    data,
    blockNumber: response._meta.block.number,
  };
};

export type OrderBook = {
  orders: OrderBookOrder[];
};

export type OrderBookOrder = {
  id: string;
  price: bigint;
  deliveryDate: bigint;
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
    price: string;
    deliveryDate: string;
    participant: {
      address: `0x${string}`;
    };
    isBuy: boolean;
    isActive: boolean;
  }[];
};
