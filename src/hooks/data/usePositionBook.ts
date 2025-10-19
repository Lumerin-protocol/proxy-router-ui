import { backgroundRefetchOpts } from "./config";
import { gql } from "graphql-request";
import { graphqlRequest } from "./graphql";
import { useQuery } from "@tanstack/react-query";
import type { GetResponse } from "../../gateway/interfaces";
import { PositionBookQuery } from "./graphql-queries";

export const POSITION_BOOK_QK = "PositionBook";

export const usePositionBook = (deliveryDate: bigint | undefined, props?: { refetch?: boolean }) => {
  const query = useQuery({
    queryKey: [POSITION_BOOK_QK, deliveryDate],
    queryFn: () => fetchPositionBookAsync(deliveryDate!),
    enabled: !!deliveryDate,
    ...(props?.refetch ? backgroundRefetchOpts : {}),
  });

  return query;
};

const fetchPositionBookAsync = async (deliveryDate: bigint) => {
  const variables = {
    deliveryDate: deliveryDate.toString(),
  };

  const response = await graphqlRequest<PositionBookResponse>(PositionBookQuery, variables);

  const data: PositionBook = {
    positions: response.positions.map((position) => ({
      id: position.id,
      price: BigInt(position.price),
      startTime: BigInt(position.startTime),
    })),
  };

  return {
    data,
    blockNumber: response._meta.block.number,
  };
};

export type PositionBook = {
  positions: PositionBookPosition[];
};

export type PositionBookPosition = {
  id: string;
  price: bigint;
  startTime: bigint;
};

type PositionBookResponse = {
  _meta: {
    block: {
      number: number;
      timestamp: string;
    };
  };
  positions: {
    id: string;
    price: string;
    startTime: string;
  }[];
};
