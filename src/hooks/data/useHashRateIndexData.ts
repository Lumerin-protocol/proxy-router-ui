import { request } from "graphql-request";
import { gql } from "graphql-request";
import { graphqlRequest } from "./graphql";
import { useQuery } from "@tanstack/react-query";
import { backgroundRefetchOpts } from "./config";
import { HashrateIndexQuery } from "./graphql-queries";

type HashrateIndexRes = {
  hashrateIndexes: {
    hashesForBTC: string;
    hashesForToken: string;
    updatedAt: string;
    id: number;
  }[];
};

export const HASHRATE_INDEX_QK = "hashrateIndex";

export const useHashrateIndexData = (props?: { refetch?: boolean }) => {
  const query = useQuery({
    queryKey: [HASHRATE_INDEX_QK],
    queryFn: convertHashrateIndexToUsd,
    ...(props?.refetch ? backgroundRefetchOpts : {}),
  });

  return query;
};

async function convertHashrateIndexToUsd() {
  const req = await graphqlRequest<HashrateIndexRes>(HashrateIndexQuery);

  // for our contract on marketplace: 100 TH/s for 24 hours
  const contractHPS = 100n * 10n ** 12n;
  const contractDuration = 24n * 3600n;

  // for luxor hashtate index 1 PH/s for 24 hours
  // const contractHPS = 1000n * 10n ** 12n;
  // const contractDuration = 24n * 3600n;

  const data = req.hashrateIndexes.map((item) => {
    if (item.hashesForToken === "0") {
      return {
        updatedAt: item.updatedAt,
        priceToken: 0n,
        priceBTC: 0n,
        id: item.id,
      };
    }

    return {
      updatedAt: item.updatedAt,
      updatedAtDate: new Date(+item.updatedAt * 1000),
      id: item.id,
      ...hashrateIndexToCurrency(contractHPS, contractDuration, BigInt(item.hashesForBTC), BigInt(item.hashesForToken)),
    };
  });
  return data;
}

function hashrateIndexToCurrency(
  contractHPS: bigint,
  contractDurationSeconds: bigint,
  hashesForBTC: bigint,
  hashesForToken: bigint,
) {
  const hashes = contractHPS * contractDurationSeconds;
  const priceToken = hashes / hashesForToken;
  const priceBTC = hashes / hashesForBTC;
  return {
    priceToken,
    priceBTC,
  };
}
