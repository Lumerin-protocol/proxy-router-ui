import { backgroundRefetchOpts } from "./config";
import { gql } from "graphql-request";
import { graphqlRequest } from "./graphql";
import { useQuery } from "@tanstack/react-query";
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
    queryKey: [
      PARTICIPANT_QK,
      participantAddress,
      props?.posOffset,
      props?.posLimit,
      props?.orderOffset,
      props?.orderLimit,
    ],
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
  const variables = {
    participantAddress,
    posOffset: props?.posOffset || 0,
    posLimit: props?.posLimit || 100,
    orderOffset: props?.orderOffset || 0,
    orderLimit: props?.orderLimit || 100,
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
      startTime: position.startTime,
      price: BigInt(position.price),
      isActive: position.isActive,
      id: position.id,
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
      deliveryDate: BigInt(order.deliveryDate),
      id: order.id,
      isActive: order.isActive,
      isBuy: order.isBuy,
      participant: {
        address: order.participant.address,
      },
      price: BigInt(order.price),
      timestamp: order.timestamp,
    })),
  };

  return {
    data,
    blockNumber: response._meta.block.number,
  };
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
  startTime: string;
  price: bigint;
  isActive: boolean;
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
  deliveryDate: bigint;
  id: string;
  isActive: boolean;
  isBuy: boolean;
  participant: {
    address: `0x${string}`;
  };
  price: bigint;
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
      startTime: string;
      price: string;
      isActive: boolean;
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
      deliveryDate: string;
      id: string;
      isActive: boolean;
      isBuy: boolean;
      participant: {
        address: `0x${string}`;
      };
      price: string;
      timestamp: string;
    }[];
  } | null;
};
