import { gql } from "graphql-request";

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
      positions(where: { isActive: true }, first: $posLimit, skip: $posOffset, orderBy: timestamp, orderDirection: desc) {
        transactionHash
        timestamp
        deliveryAt
        pricePerDay
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
      orders(where: { isActive: true }, first: $orderLimit, skip: $orderOffset, orderBy: timestamp, orderDirection: desc) {
        closedAt
        closedBy
        deliveryAt
        id
        isActive
        isBuy
        participant {
          address
        }
        pricePerDay
        timestamp
      }
    },
    _meta {
      block {
        number
        timestamp
      }
    }
  }
`;

export const PositionsBookQuery = gql`
  query PositionsBookQuery($address: ID!) {
  positions(
    where: {
      or: [
        { isActive: true, buyer_: { address: $address } },
        { isActive: true, seller_: { address: $address } }
      ]
    },
    orderBy: timestamp,
    orderDirection: desc
  ) {
    transactionHash
    timestamp
    deliveryAt
    pricePerDay
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
  _meta {
    block {
      number
      timestamp
    }
  }
}
`;

export const OrderBookQuery = gql`
  query OrderBook($deliveryAt: BigInt!) {
    orders(where: { deliveryAt: $deliveryAt, isActive: true }) {
      id
      pricePerDay
      deliveryAt
      participant {
        address
      }
      isBuy,
      isActive
    },
    _meta {
      block {
        number
        timestamp
      }
    }
  }
`;

export const ContractSpecsQuery = gql`
  query ContractSpecs {
    futures(id: "0") {
      deliveryDurationDays
      liquidationMarginPercent
      hashrateOracleAddress
      minimumPriceIncrement
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

export const HashrateIndexQuery = gql`
  query HashpriceIndex($startDate: BigInt!, $first: Int!) {
    hashrateIndexes(
      where: { updatedAt_gte: $startDate }
      orderBy: updatedAt
      orderDirection: desc
      first: $first
    ) {
      id
      hashesForBTC
      hashesForToken
      updatedAt
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
