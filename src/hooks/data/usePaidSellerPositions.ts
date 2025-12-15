import { backgroundRefetchOpts } from "./config";
import { graphqlRequest } from "./graphql";
import { useQuery } from "@tanstack/react-query";
import type { GetResponse } from "../../gateway/interfaces";
import { PaidSellerPositionsQuery } from "./graphql-queries";

export const PAID_SELLER_POSITIONS_QK = "PaidSellerPositions";

export const usePaidSellerPositions = (address: `0x${string}` | undefined, props?: { refetch?: boolean }) => {
  const query = useQuery({
    queryKey: [PAID_SELLER_POSITIONS_QK, address],
    queryFn: () => fetchPaidSellerPositionsAsync(address!),
    enabled: !!address,
    ...(props?.refetch ? backgroundRefetchOpts : {}),
  });

  return query;
};

const fetchPaidSellerPositionsAsync = async (address: `0x${string}`) => {
  const variables = {
    address: address,
  };

  const response = await graphqlRequest<PaidSellerPositionsResponse>(PaidSellerPositionsQuery, variables);

  const data: PaidSellerPositions = {
    positions: response.positions.map((position) => ({
      deliveryAt: position.deliveryAt,
      sellPricePerDay: BigInt(position.sellPricePerDay),
    })),
  };

  return {
    data,
    blockNumber: response._meta.block.number,
  };
};

export type PaidSellerPositions = {
  positions: {
    deliveryAt: string;
    sellPricePerDay: bigint;
  }[];
};

type PaidSellerPositionsResponse = {
  _meta: {
    block: {
      number: number;
      timestamp: string;
    };
  };
  positions: {
    deliveryAt: string;
    sellPricePerDay: string;
  }[];
};
