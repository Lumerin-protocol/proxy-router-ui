import { backgroundRefetchOpts } from "./config";
import { gql } from "graphql-request";
import { graphqlRequest } from "./graphql";
import { type QueryClient, useQuery } from "@tanstack/react-query";
import type { GetResponse } from "../../gateway/interfaces";
import { zeroAddress } from "viem";

export const AVAILABLE_CONTRACTS_QK = "availableContracts";

export const useContractsForSale = (props?: { refetch?: boolean }) => {
  const query = useQuery({
    queryKey: [AVAILABLE_CONTRACTS_QK],
    queryFn: fetchContractsAsync,
    ...(props?.refetch ? backgroundRefetchOpts : {}),
  });

  return query;
};

const fetchContractsAsync = async (): Promise<GetResponse<AvailableContract[]>> => {
  const now = Math.floor(Date.now() / 1000).toString();
  const response = await graphqlRequest<ContractsResponse>(query, { now });
  const data = response.implementations.map(mapContract);
  return {
    data,
    blockNumber: response._meta.block.number,
  };
};

function mapContract(e: ContractsResponse["implementations"][number]): AvailableContract {
  const { _terms, resellChain, owner, _address, purchasesCount, resellsCount, earlyCloseoutsCount } = e;
  const { _version, _speed, _length } = _terms;
  const { _resellProfitTarget, _resellPrice } = resellChain[resellChain.length - 1];

  //TODO: enable future terms
  // if (hasFutureTerms && futureTerms && state === "0") {
  //   speed = futureTerms.speed;
  //   length = futureTerms.length;
  //   version = futureTerms.version;
  //   profitTarget = futureTerms.profitTarget;
  // }

  return {
    _id: e.id,
    address: _address,
    speed: BigInt(_speed),
    length: BigInt(_length),
    profitTargetPercent: _resellProfitTarget,
    resellPrice: BigInt(_resellPrice),
    owner: owner.address as `0x${string}`,
    version: Number(_version),
    isResellable: e.isResellable,
    resellChain: resellChain.map((rc) => ({
      account: rc._account as `0x${string}`,
      validator: rc._validator as `0x${string}`,
      price: BigInt(rc._price),
      fee: BigInt(rc._fee),
      startTime: BigInt(rc._startTime),
      lastSettlementTime: BigInt(rc._lastSettlementTime),
      seller: rc._seller as `0x${string}`,
      resellProfitTarget: rc._resellProfitTarget,
      resellPrice: rc._resellPrice,
      isResellable: rc._isResellable,
      isResellToDefaultBuyer: rc._isResellToDefaultBuyer,
    })),
    stats: {
      purchasesCount: purchasesCount,
      resellsCount: resellsCount,
      earlyCloseoutsCount: earlyCloseoutsCount,
    },
  };
}

// if isResellable = true, then this contract can be purchased in any time. (even if is processing (no Available))

const query = gql`
  query GetContractsForSale($now: BigInt!) {
    implementations(
      where: { and: [{ endTime_lt: $now }, { isDeleted: false }] }
    ) {
      _address
      blockTimestamp
      blockNumber
      endTime
      isResellable
      owner {
        address
      }
      purchasesCount
      earlyCloseoutsCount
      resellsCount
      _terms {
        _contractAddress
        _length
        _updatedBlockNumber
        _speed
        id
        _version
        _updatedTimestamp
      }
      resellChain {
        id
        _account
        _validator
        _price
        _fee
        _startTime
        _lastSettlementTime
        _seller
        _resellProfitTarget
        _resellPrice
        _isResellable
        _isResellToDefaultBuyer
      }
    }
    _meta {
      block {
        number
        timestamp
      }
    }
  }
`;

export type AvailableContract = {
  _id: string;
  address: `0x${string}`;
  speed: bigint;
  length: bigint;
  profitTargetPercent: number;
  resellPrice: bigint;
  version: number;
  owner: `0x${string}`;
  isResellable: boolean;
  resellChain: {
    account: `0x${string}`;
    validator: `0x${string}`;
    price: bigint;
    fee: bigint;
    startTime: bigint;
    lastSettlementTime: bigint;
    seller: `0x${string}`;
    resellProfitTarget: number;
    isResellable: boolean;
    isResellToDefaultBuyer: boolean;
  }[];
  stats: {
    purchasesCount: number;
    resellsCount: number;
    earlyCloseoutsCount: number;
  };
};

type ContractsResponse = {
  _meta: {
    block: {
      number: number;
      timestamp: string;
    };
  };
  implementations: {
    id: `0x${string}`;
    _terms: {
      id: `0x${string}`;
      _length: string;
      _updatedBlockNumber: string;
      _speed: string;
      _version: string;
      _updatedTimestamp: string;
    };
    resellChain: {
      id: string;
      _account: `0x${string}`;
      _validator: `0x${string}`;
      _price: string;
      _fee: string;
      _startTime: string;
      _lastSettlementTime: string;
      _seller: `0x${string}`;
      _resellProfitTarget: number;
      _resellPrice: string;
      _isResellable: boolean;
      _isResellToDefaultBuyer: boolean;
    }[];
    blockTimestamp: string;
    endTime: string;
    isResellable: boolean;
    owner: {
      address: `0x${string}`;
    };
    _address: `0x${string}`;
    purchasesCount: number;
    resellsCount: number;
    earlyCloseoutsCount: number;
  }[];
};

/** Polls the indexer for new contracts until the block number is reached. Should be used to make sure mutations are reflected in the indexer cache. */
export const waitForBlockNumber = async (blockNumber: bigint, qc: QueryClient) => {
  const delay = 1000;
  const maxAttempts = 30; // 30 attempts with 2s delay = max 1 minute wait

  let attempts = 0;
  while (attempts < maxAttempts) {
    await new Promise((resolve) => setTimeout(resolve, delay));
    // Force a fresh fetch of the data
    await qc.refetchQueries({ queryKey: [AVAILABLE_CONTRACTS_QK] });

    const data = qc.getQueryData<GetResponse<[]>>([AVAILABLE_CONTRACTS_QK]);
    const currentBlock = data?.blockNumber;

    if (currentBlock !== undefined && currentBlock >= Number(blockNumber)) {
      return;
    }
    // Wait 2 seconds before next attempt
    attempts++;
  }

  throw new Error(`Timeout waiting for block number ${blockNumber}`);
};
