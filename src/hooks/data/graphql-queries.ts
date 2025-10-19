import { gql } from "graphql-request";

export const HashrateIndexQuery = gql`
  query HashpriceIndex($from: BigInt!, $to: BigInt!) {
    hashrateIndexes(
      where: { updatedAt_gt: $from, updatedAt_lte: $to }
      orderBy: updatedAt
      orderDirection: asc
    ) {
      hashesForBTC
      hashesForToken
      id
      updatedAt
    }
  }
`;

export const ParticipantQuery = gql`
  query Participant(
    $participantAddress: ID!
    $posOffset: Int!
    $posLimit: Int!
    $orderOffset: Int!
    $orderLimit: Int!
  ) {
    participant(id: $participantAddress) {
      address
      balance
      lastBalanceUpdate
      orderCount
      totalDeposited
      totalVolume
      totalWithdrawn
      positions(first: $posLimit, skip: $posOffset, orderBy: timestamp, orderDirection: desc) {
        transactionHash
        timestamp
        startTime
        price
        isActive
        id
        closedBy
        closedAt
        buyer {
          address
        }
        seller {
          address
        }
      }
      orders(first: $orderLimit, skip: $orderOffset, orderBy: timestamp, orderDirection: desc) {
        closedAt
        closedBy
        deliveryDate
        id
        isActive
        isBuy
        participant {
          address
        }
        price
        timestamp
      }
    }
  }
`;

export const DeliveryDatesQuery = gql`
  query DeliveryDates($now: BigInt!) {
    deliveryDates(where: { deliveryDate_gte: $now }, orderBy: deliveryDate, orderDirection: asc) {
      deliveryDate
      id
    },
    _meta {
      block {
        number
        timestamp
      }
    }
  }
`;

export const OrderBookQuery = gql`
  query OrderBook($deliveryDate: BigInt!) {
    orders(where: { deliveryDate: $deliveryDate }, orderBy: price, orderDirection: desc) {
      id
      price
      deliveryDate
      participant {
        address
      }
      isBuy
    }
  }
`;

export const PositionBookQuery = gql`
  query PositionBook($deliveryDate: BigInt!) {
    positions(where: { startTime: $deliveryDate }) {
      id
      price
      startTime
    }
  }
`;

// Last sell/buy order - derived from order book query result

// Total open interest - derived from position book query result

export const ContractSpecsQuery = gql`
  query ContractSpecs {
    futures(id: "0") {
      buyerLiquidationMarginPercent
      closeoutCount
      contractActiveCount
      contractCount
      deliveryDurationSeconds
      hashrateOracleAddress
      minSellerStake
      priceLadderStep
      purchaseCount
      sellerLiquidationMarginPercent
      speedHps
      tokenAddress
      validatorAddress
    }
    _meta {
      block {
        number
        timestamp
      }
    }
  }
`;
