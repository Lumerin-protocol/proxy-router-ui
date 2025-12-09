import { useQuery } from "@tanstack/react-query";
import { graphqlRequest } from "./graphql";
import { HistoricalOrdersQuery } from "./graphql-queries";

export const HISTORICAL_ORDERS_QK = "HistoricalOrders";

const PAGE_SIZE = 100;
const THIRTY_DAYS_IN_SECONDS = 30 * 24 * 60 * 60;

export type HistoricalOrder = {
  id: string;
  timestamp: string;
  deliveryAt: bigint;
  pricePerDay: bigint;
  isBuy: boolean;
  isActive: boolean;
  closedAt: string | null;
  participant: {
    address: `0x${string}`;
  };
};

type HistoricalOrdersResponse = {
  _meta: {
    block: {
      number: number;
      timestamp: string;
    };
  };
  orders: {
    id: string;
    timestamp: string;
    deliveryAt: string;
    pricePerDay: string;
    isBuy: boolean;
    isActive: boolean;
    closedAt: string | null;
    participant: {
      address: `0x${string}`;
    };
  }[];
};

const fetchAllHistoricalOrders = async (
  address: `0x${string}`,
): Promise<{
  data: HistoricalOrder[];
  blockNumber: number;
}> => {
  const now = Math.floor(Date.now() / 1000);
  const thirtyDaysAgo = now - THIRTY_DAYS_IN_SECONDS;

  let allOrders: HistoricalOrder[] = [];
  let skip = 0;
  let hasMore = true;
  let blockNumber = 0;

  while (hasMore) {
    const variables = {
      participantAddress: address,
      thirtyDaysAgo: thirtyDaysAgo,
      first: PAGE_SIZE,
      skip: skip,
    };

    const response = await graphqlRequest<HistoricalOrdersResponse>(HistoricalOrdersQuery, variables);

    blockNumber = response._meta.block.number;

    const orders = response.orders.map((order) => ({
      id: order.id,
      timestamp: order.timestamp,
      deliveryAt: BigInt(order.deliveryAt),
      pricePerDay: BigInt(order.pricePerDay),
      isBuy: order.isBuy,
      isActive: order.isActive,
      closedAt: order.closedAt,
      participant: {
        address: order.participant.address,
      },
    }));

    allOrders = [...allOrders, ...orders];

    if (response.orders.length < PAGE_SIZE) {
      hasMore = false;
    } else {
      skip += PAGE_SIZE;
    }
  }

  return {
    data: allOrders,
    blockNumber,
  };
};

export const useHistoricalOrders = (address: `0x${string}` | undefined, enabled: boolean = false) => {
  return useQuery({
    queryKey: [HISTORICAL_ORDERS_QK, address],
    queryFn: () => fetchAllHistoricalOrders(address!),
    enabled: !!address && enabled,
    staleTime: 60 * 1000, // 1 minute
  });
};
