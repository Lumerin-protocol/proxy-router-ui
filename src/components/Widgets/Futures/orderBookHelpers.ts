import type { OrderBookOrder } from "../../../hooks/data/useOrderBook";

export interface OrderBookData {
  bidUnits: number | null;
  price: number;
  askUnits: number | null;
  isHighlighted?: boolean;
  highlightColor?: "red" | "green";
}

/**
 * Creates the final order book data by merging live order book data with prop data
 * @param orderBookData - Live order book data from the API
 * @param propOrderBookData - Static order book data passed as props
 * @returns Final merged and sorted order book data
 */
export const createFinalOrderBookData = (
  orderBookData: OrderBookOrder[],
  propOrderBookData?: OrderBookData[],
): OrderBookData[] => {
  // Group fetched order book by price and side
  const liveGroupedMap = new Map<number, { bidUnits: number | null; askUnits: number | null }>();

  if (orderBookData && orderBookData.length > 0) {
    const priceToSideCount = new Map<number, { bids: number; asks: number }>();

    for (const order of orderBookData) {
      const price = Math.round((Number(order.price) / 1e6) * 100) / 100; // USDC with 2 decimals
      const entry = priceToSideCount.get(price) || { bids: 0, asks: 0 };
      if (order.isBuy) {
        entry.bids += 1; // counting orders as units for now
      } else {
        entry.asks += 1;
      }
      priceToSideCount.set(price, entry);
    }

    // Fill liveGroupedMap from aggregated counts
    for (const [price, counts] of priceToSideCount.entries()) {
      liveGroupedMap.set(price, {
        bidUnits: counts.bids > 0 ? counts.bids : null,
        askUnits: counts.asks > 0 ? counts.asks : null,
      });
    }
  }

  // Start merged map with prop data (so prop-only prices are kept)
  const mergedMap = new Map<number, { bidUnits: number | null; askUnits: number | null }>();
  if (propOrderBookData && propOrderBookData.length > 0) {
    for (const row of propOrderBookData) {
      mergedMap.set(row.price, { bidUnits: row.bidUnits, askUnits: row.askUnits });
    }
  }

  // Overlay live data ensuring all live prices are present and preferred
  for (const [price, live] of liveGroupedMap.entries()) {
    const existing = mergedMap.get(price);
    if (!existing) {
      mergedMap.set(price, { bidUnits: live.bidUnits, askUnits: live.askUnits });
    } else {
      mergedMap.set(price, {
        bidUnits: live.bidUnits !== null ? live.bidUnits : existing.bidUnits,
        askUnits: live.askUnits !== null ? live.askUnits : existing.askUnits,
      });
    }
  }

  // Build final array sorted by price desc
  return Array.from(mergedMap.entries())
    .sort((a, b) => b[0] - a[0])
    .map(([price, v]) => ({ price, bidUnits: v.bidUnits, askUnits: v.askUnits }));
};
