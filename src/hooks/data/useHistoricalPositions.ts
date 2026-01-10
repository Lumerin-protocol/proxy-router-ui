import { useQuery } from "@tanstack/react-query";
import { graphqlRequest } from "./graphql";
import { HistoricalPositionsQuery } from "./graphql-queries";

export const HISTORICAL_POSITIONS_QK = "HistoricalPositions";

const PAGE_SIZE = 100;
const THIRTY_DAYS_IN_SECONDS = 30 * 24 * 60 * 60;

export type HistoricalPosition = {
  id: string;
  timestamp: string;
  deliveryAt: string;
  sellPricePerDay: bigint;
  buyPricePerDay: bigint;
  buyerPnl: number;
  sellerPnl: number;
  isActive: boolean;
  closedAt: string | null;
  buyer: {
    address: `0x${string}`;
  };
  seller: {
    address: `0x${string}`;
  };
};

type HistoricalPositionsResponse = {
  _meta: {
    block: {
      number: number;
      timestamp: string;
    };
  };
  positions: {
    id: string;
    timestamp: string;
    deliveryAt: string;
    sellPricePerDay: string;
    buyPricePerDay: string;
    buyerPnl: string;
    sellerPnl: string;
    isActive: boolean;
    closedAt: string | null;
    buyer: {
      address: `0x${string}`;
    };
    seller: {
      address: `0x${string}`;
    };
  }[];
};

const fetchAllHistoricalPositions = async (
  address: `0x${string}`,
): Promise<{
  data: HistoricalPosition[];
  blockNumber: number;
}> => {
  const now = Math.floor(Date.now() / 1000);
  const thirtyDaysAgo = now - THIRTY_DAYS_IN_SECONDS;

  let allPositions: HistoricalPosition[] = [];
  let skip = 0;
  let hasMore = true;
  let blockNumber = 0;

  while (hasMore) {
    const variables = {
      address: address,
      thirtyDaysAgo: thirtyDaysAgo,
      first: PAGE_SIZE,
      skip: skip,
    };

    const response = await graphqlRequest<HistoricalPositionsResponse>(HistoricalPositionsQuery, variables);

    blockNumber = response._meta.block.number;

    debugger;

    const positions = response.positions.map((position) => ({
      id: position.id,
      timestamp: position.timestamp,
      deliveryAt: position.deliveryAt,
      sellPricePerDay: BigInt(position.sellPricePerDay),
      buyPricePerDay: BigInt(position.buyPricePerDay),
      buyerPnl: Number(position.buyerPnl),
      sellerPnl: Number(position.sellerPnl),
      isActive: position.isActive,
      closedAt: position.closedAt,
      buyer: {
        address: position.buyer.address,
      },
      seller: {
        address: position.seller.address,
      },
    }));

    allPositions = [...allPositions, ...positions];

    if (response.positions.length < PAGE_SIZE) {
      hasMore = false;
    } else {
      skip += PAGE_SIZE;
    }
  }

  return {
    data: allPositions,
    blockNumber,
  };
};

export const useHistoricalPositions = (address: `0x${string}` | undefined, enabled: boolean = false) => {
  return useQuery({
    queryKey: [HISTORICAL_POSITIONS_QK, address],
    queryFn: () => fetchAllHistoricalPositions(address!),
    enabled: !!address && enabled,
    staleTime: 60 * 1000, // 1 minute
  });
};
