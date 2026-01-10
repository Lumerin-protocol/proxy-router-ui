import { gql } from "graphql-request";

export const ParticipantQuery = gql`
  query Participant(
    $participantAddress: ID!
    $orderOffset: Int!
    $orderLimit: Int!
    $now: BigInt!
  ) {
    participant(id: $participantAddress) {
      address
      balance
      lastBalanceUpdate
      orderCount
      totalDeposited
      totalVolume
      totalWithdrawn
      orders(where: { isActive: true, deliveryAt_gt: $now }, first: $orderLimit, skip: $orderOffset, orderBy: timestamp, orderDirection: desc) {
        closedAt
        closedBy
        deliveryAt
        id
        destURL
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
  query PositionsBookQuery($address: ID!, $now: BigInt!) {
  positions(
    where: {
      or: [
        { isActive: true, deliveryAt_gt: $now, buyer_: { address: $address } },
        { isActive: true, deliveryAt_gt: $now, seller_: { address: $address } }
      ]
    },
    orderBy: timestamp,
    orderDirection: desc
  ) {
    transactionHash
    timestamp
    deliveryAt
    sellPricePerDay
    buyPricePerDay
    isActive
    id
    closedBy
    closedAt
    destURL
    isPaid
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

export const AggregateOrderBookQuery = gql`
  query AggregateOrderBook($deliveryAt: BigInt!) {
    deliveryDateOrders (where: { deliveryDate: $deliveryAt }) {
      buyOrdersCount
      deliveryDate
      id
      price
      sellOrdersCount
    }
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

export const AggregatedHashrateIndexQuery = gql`
  query AggregatedHashrateIndexQuery($interval: String!) {
  hashesForTokenCandles(interval: $interval) {
    count
    id
    sum
    timestamp
  }
}`;

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

export const PaidSellerPositionsQuery = gql`
  query PaidSellerPositionsQuery($address: ID!) {
    positions(
      where: { isPaid: true, seller_: { address: $address }}
    ) {
      deliveryAt
      sellPricePerDay
    }
    _meta {
      block {
        number
        timestamp
      }
    }
  }
`;

// Historical positions query (last 30 days, isActive: false) with cursor pagination
export const HistoricalPositionsQuery = gql`
  query HistoricalPositionsQuery($address: ID!, $thirtyDaysAgo: BigInt!, $first: Int!, $skip: Int!) {
    positions(
      where: {
        or: [
          { isActive: false, deliveryAt_gte: $thirtyDaysAgo, buyer_: { address: $address } },
          { isActive: false, deliveryAt_gte: $thirtyDaysAgo, seller_: { address: $address } }
        ]
      },
      first: $first,
      skip: $skip,
      orderBy: timestamp,
      orderDirection: desc
    ) {
      id
      timestamp
      deliveryAt
      sellPricePerDay
      buyPricePerDay
      buyerPnl
      sellerPnl
      isActive
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

// Historical orders query (last 30 days, isActive: false) with cursor pagination
export const HistoricalOrdersQuery = gql`
  query HistoricalOrdersQuery($participantAddress: ID!, $thirtyDaysAgo: BigInt!, $first: Int!, $skip: Int!) {
    orders(
      where: { 
        isActive: false, 
        deliveryAt_gte: $thirtyDaysAgo,
        participant_: { address: $participantAddress }
      },
      first: $first,
      skip: $skip,
      orderBy: timestamp,
      orderDirection: desc
    ) {
      id
      timestamp
      deliveryAt
      pricePerDay
      isBuy
      isActive
      closedAt
      participant {
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
