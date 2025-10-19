import { backgroundRefetchOpts } from "./config";
import { gql } from "graphql-request";
import { graphqlRequest } from "./graphql";
import { useQuery } from "@tanstack/react-query";
import type { GetResponse } from "../../gateway/interfaces";
import { DeliveryDatesQuery } from "./graphql-queries";

export const DELIVERY_DATES_SPECS_QK = "DeliveryDates";

export const useDeliveryDates = (props?: { refetch?: boolean }) => {
  const query = useQuery({
    queryKey: [DELIVERY_DATES_SPECS_QK],
    queryFn: fetchDeliveryDatesAsync,
    ...(props?.refetch ? backgroundRefetchOpts : {}),
  });

  return query;
};

const fetchDeliveryDatesAsync = async (): Promise<GetResponse<DeliveryDate[]>> => {
  const now = Math.floor(new Date().getTime() / 1000);
  const response = await graphqlRequest<DeliveryDatesResponse>(DeliveryDatesQuery, { now });
  return {
    data: response.deliveryDates,
    blockNumber: response._meta.block.number,
  };
};

export type DeliveryDate = {
  deliveryDate: number;
  id: string;
};

type DeliveryDatesResponse = {
  _meta: {
    block: {
      number: number;
      timestamp: string;
    };
  };
  deliveryDates: DeliveryDate[];
};
