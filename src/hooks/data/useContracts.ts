import { type QueryClient, useQuery } from "@tanstack/react-query";
import { getContractsV2 } from "../../gateway/indexer";
import { ContractState, type HashRentalContract } from "../../types/types";
import type { GetResponse, IndexerContractEntry } from "../../gateway/interfaces";
import { backgroundRefetchOpts } from "./config";
import { isAddressEqual } from "viem";

export const [CONTRACTS_QK] = "contracts";
interface Props {
  select?: ((data: GetResponse<HashRentalContract[]>) => GetResponse<HashRentalContract[]>) | undefined;
  refetch?: boolean;
  enabled?: boolean;
}

export const useSellerContracts = (props: { address?: `0x${string}` | undefined }) => {
  return useContracts({
    select: (data) => ({
      ...data,
      data: data.data.filter((c) => {
        return isAddressEqual(c.seller as `0x${string}`, props.address!);
      }),
    }),
    enabled: !!props.address,
  });
};

export const useAvailableContracts = () => {
  return useContracts({
    select: (data) => ({
      ...data,
      data: data.data.filter((c) => c.state === ContractState.Available && !c.isDeleted),
    }),
  });
};

export const useBuyerContracts = (props: { address: `0x${string}` | undefined }) => {
  return useContracts({
    select: (data) => ({
      ...data,
      data: data.data.filter((c) => c.seller !== props.address),
    }),
    enabled: !!props.address,
  });
};

export const useContractV2 = (props: { address: `0x${string}`; refetch?: boolean }) => {
  const query = useQuery({
    queryKey: [CONTRACTS_QK, props.address],
    queryFn: fetchContractsAsync,
    select: (data) => data.data.find((c) => isAddressEqual(c.id as `0x${string}`, props.address)),
  });

  return query;
};

export const useContracts = (props?: Props) => {
  const { select, refetch = true, enabled = true } = props || {};
  const fetchContractsAsync = async (): Promise<GetResponse<HashRentalContract[]>> => {
    const response = await getContractsV2();
    const data = response.data.map(mapContract);
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
    enabled: enabled,
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

function mapContract(e: IndexerContractEntry): HashRentalContract {
  const { hasFutureTerms, futureTerms, state } = e;
  let { version, speed, length, price, fee, profitTarget } = e;
  if (hasFutureTerms && futureTerms && state === "0") {
    speed = futureTerms.speed;
    length = futureTerms.length;
    version = futureTerms.version;
    profitTarget = futureTerms.profitTarget;
  }

  return {
    id: e.id,
    price,
    fee,
    speed,
    length,
    profitTargetPercent: profitTarget,
    buyer: e.buyer,
    seller: e.seller,
    validator: e.validator,
    timestamp: e.startingBlockTimestamp,
    state: e.state,
    encryptedPoolData: e.encrValidatorUrl,
    version,
    isDeleted: e.isDeleted,
    balance: e.balance,
    feeBalance: e.feeBalance,
    stats: e.stats,
    history: e.history.map((h) => {
      return {
        id: e.id,
        goodCloseout: h.isGoodCloseout,
        buyer: h.buyer,
        endTime: h.endTime,
        purchaseTime: h.purchaseTime,
        fee: h.fee,
        validator: h.validator,
        price: h.price,
        speed: h.speed,
        length: h.length,
      };
    }),
  };
}

const fetchContractsAsync = async (): Promise<GetResponse<HashRentalContract[]>> => {
  const response = await getContractsV2();
  const data = response.data.map(mapContract);
  return {
    data,
    blockNumber: response.blockNumber,
  };
};
