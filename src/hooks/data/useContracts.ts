import { type QueryClient, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { getContractsV2 } from "../../gateway/indexer";
import type { HashRentalContract } from "../../types/types";
import type { GetResponse } from "../../gateway/interfaces";
import { backgroundRefetchOpts } from "./config";

export const CONTRACTS_QK = "contracts";
interface Props {
  select?: ((data: GetResponse<HashRentalContract[]>) => GetResponse<HashRentalContract[]>) | undefined;
  refetch?: boolean;
}

export const useSellerContracts = (props: { address?: `0x${string}` | undefined }) => {
  return useContracts({
    select: (data) => ({
      ...data,
      data: data.data.filter((c) => c.seller === props.address),
    }),
  });
};

export const useBuyerContracts = (props: { address?: `0x${string}` | undefined }) => {
  return useContracts({
    select: (data) => ({
      ...data,
      data: data.data.filter((c) => c.seller !== props.address && c.isDeleted === false),
    }),
  });
};

export const useContract = (props: { address: `0x${string}`; refetch?: boolean }) => {
  const res = useContracts({ refetch: props.refetch });
  return {
    ...res,
    data: res.data?.find((c) => c.id === props.address),
  };
};

export const useContracts = (props?: Props) => {
  const { select, refetch = true } = props || {};
  const fetchContractsAsync = async (): Promise<GetResponse<HashRentalContract[]>> => {
    console.log("fetching contracts");
    const response = await getContractsV2();
    const data = response.data.map((e) => {
      const { hasFutureTerms, futureTerms, state } = e;
      let { version, speed, length, price, fee } = e;
      if (hasFutureTerms && futureTerms && state === "0") {
        speed = futureTerms.speed;
        length = futureTerms.length;
        price = futureTerms.price;
        version = futureTerms.version;
      }
      return {
        id: e.id,
        price,
        fee,
        speed,
        length,
        buyer: e.buyer,
        seller: e.seller,
        validator: e.validator,
        timestamp: e.startingBlockTimestamp,
        state: e.state,
        encryptedPoolData: e.encrValidatorUrl,
        profitTargetPercent: e.profitTarget,
        version,
        isDeleted: e.isDeleted,
        balance: e.balance,
        feeBalance: e.feeBalance,
        history: e.history.map((h) => {
          return {
            id: e.id,
            goodCloseout: h.isGoodCloseout,
            buyer: h.buyer,
            endTime: h.endTime,
            purchaseTime: h.purchaseTime,
            price: h.price,
            speed: h.speed,
            length: h.length,
          };
        }),
      };
    });
    return {
      data,
      blockNumber: response.blockNumber,
    };
  };

  const query = useQuery({
    ...(refetch ? backgroundRefetchOpts : {}),
    queryKey: [CONTRACTS_QK],
    queryFn: fetchContractsAsync,
    select: select,
  });

  const { data, ...rest } = query;

  return {
    ...rest,
    data: data?.data,
    blockNumber: data?.blockNumber,
  };
};

/** Polls the indexer for new contracts until the block number is reached. Should be used to make sure mutations are reflected in the indexer cache. */
export const waitForBlockNumber = async (blockNumber: bigint, qc: QueryClient) => {
  const delay = 1000;
  const maxAttempts = 30; // 30 attempts with 2s delay = max 1 minute wait

  let attempts = 0;
  while (attempts < maxAttempts) {
    await new Promise((resolve) => setTimeout(resolve, delay));
    // Force a fresh fetch of the data
    await qc.refetchQueries({ queryKey: [CONTRACTS_QK] });

    const data = qc.getQueryData<GetResponse<HashRentalContract[]>>([CONTRACTS_QK]);
    const currentBlock = data?.blockNumber;

    if (currentBlock !== undefined && currentBlock >= Number(blockNumber)) {
      return;
    }
    // Wait 2 seconds before next attempt
    attempts++;
  }

  throw new Error(`Timeout waiting for block number ${blockNumber}`);
};
