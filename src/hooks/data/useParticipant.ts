import { backgroundRefetchOpts } from "./config";
import { gql } from "graphql-request";
import { graphqlRequest } from "./graphql";
import { QueryClient, useQuery } from "@tanstack/react-query";
import type { GetResponse } from "../../gateway/interfaces";
import { ParticipantQuery } from "./graphql-queries";

export const PARTICIPANT_QK = "Participant";

export const useParticipant = (
  participantAddress: `0x${string}` | undefined,
  props?: {
    refetch?: boolean;
    posOffset?: number;
    posLimit?: number;
    orderOffset?: number;
    orderLimit?: number;
  },
) => {
  const query = useQuery({
    queryKey: [PARTICIPANT_QK],
    queryFn: () => fetchParticipantAsync(participantAddress!, props),
    enabled: !!participantAddress,
    ...(props?.refetch ? backgroundRefetchOpts : {}),
  });

  return query;
};

const fetchParticipantAsync = async (
  participantAddress: `0x${string}`,
  props?: {
    posOffset?: number;
    posLimit?: number;
    orderOffset?: number;
    orderLimit?: number;
  },
) => {
  const now = Math.floor(Date.now() / 1000);
  const variables = {
    participantAddress,
    posOffset: props?.posOffset || 0,
    posLimit: props?.posLimit || 100,
    orderOffset: props?.orderOffset || 0,
    orderLimit: props?.orderLimit || 100,
    now,
  };

  const response = await graphqlRequest<ParticipantResponse>(ParticipantQuery, variables);

  if (!response.participant) {
    return {
      data: null,
      blockNumber: response._meta.block.number,
    };
  }

  const data: Participant = {
    address: response.participant.address,
    balance: BigInt(response.participant.balance),
    lastBalanceUpdate: response.participant.lastBalanceUpdate,
    orderCount: response.participant.orderCount,
    totalDeposited: BigInt(response.participant.totalDeposited),
    totalVolume: BigInt(response.participant.totalVolume),
    totalWithdrawn: BigInt(response.participant.totalWithdrawn),
    positions: response.participant.positions.map((position) => ({
      transactionHash: position.transactionHash,
      timestamp: position.timestamp,
      deliveryAt: position.deliveryAt,
      pricePerDay: BigInt(position.pricePerDay),
      isActive: position.isActive,
      id: position.id,
      destURL: position.destURL,
      closedBy: position.closedBy,
      closedAt: position.closedAt,
      buyer: {
        address: position.buyer.address,
      },
      seller: {
        address: position.seller.address,
      },
    })),
    orders: response.participant.orders.map((order) => ({
      closedAt: order.closedAt,
      closedBy: order.closedBy,
      deliveryAt: BigInt(order.deliveryAt),
      id: order.id,
      isActive: order.isActive,
      isBuy: order.isBuy,
      destURL: order.destURL,
      participant: {
        address: order.participant.address,
      },
      pricePerDay: BigInt(order.pricePerDay),
      timestamp: order.timestamp,
    })),
  };

  return {
    data,
    blockNumber: response._meta.block.number,
  };
};

export const waitForBlockNumber = async (blockNumber: bigint, participantAddress: `0x${string}`) => {
  const delay = 1000;
  const maxAttempts = 30; // 30 attempts with 2s delay = max 1 minute wait

  let attempts = 0;
  while (attempts < maxAttempts) {
    await new Promise((resolve) => setTimeout(resolve, delay));
    var data = await fetchParticipantAsync(participantAddress);
    const currentBlock = data?.blockNumber;

    if (currentBlock !== undefined && currentBlock >= Number(blockNumber)) {
      return;
    }
    // Wait 2 seconds before next attempt
    attempts++;
  }

  throw new Error(`Timeout waiting for block number ${blockNumber}`);
};

export type Participant = {
  address: `0x${string}`;
  balance: bigint;
  lastBalanceUpdate: string;
  orderCount: number;
  totalDeposited: bigint;
  totalVolume: bigint;
  totalWithdrawn: bigint;
  positions: ParticipantPosition[];
  orders: ParticipantOrder[];
};

export type ParticipantPosition = {
  transactionHash: `0x${string}`;
  timestamp: string;
  deliveryAt: string;
  pricePerDay: bigint;
  isActive: boolean;
  destURL: string;
  id: string;
  closedBy: string | null;
  closedAt: string | null;
  buyer: {
    address: `0x${string}`;
  };
  seller: {
    address: `0x${string}`;
  };
};

export type ParticipantOrder = {
  closedAt: string | null;
  closedBy: string | null;
  deliveryAt: bigint;
  id: string;
  isActive: boolean;
  isBuy: boolean;
  destURL: string;
  participant: {
    address: `0x${string}`;
  };
  pricePerDay: bigint;
  timestamp: string;
};

type ParticipantResponse = {
  _meta: {
    block: {
      number: number;
      timestamp: string;
    };
  };
  participant: {
    address: `0x${string}`;
    balance: string;
    lastBalanceUpdate: string;
    orderCount: number;
    totalDeposited: string;
    totalVolume: string;
    totalWithdrawn: string;
    positions: {
      transactionHash: `0x${string}`;
      timestamp: string;
      deliveryAt: string;
      pricePerDay: string;
      isActive: boolean;
      destURL: string;
      id: string;
      closedBy: string | null;
      closedAt: string | null;
      buyer: {
        address: `0x${string}`;
      };
      seller: {
        address: `0x${string}`;
      };
    }[];
    orders: {
      closedAt: string | null;
      closedBy: string | null;
      deliveryAt: string;
      destURL: string;
      id: string;
      isActive: boolean;
      isBuy: boolean;
      participant: {
        address: `0x${string}`;
      };
      pricePerDay: string;
      timestamp: string;
    }[];
  } | null;
};
