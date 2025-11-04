import type { OrderBookOrder } from "../../../hooks/data/useOrderBook";
import type { FuturesContractSpecs } from "../../../hooks/data/useFuturesContractSpecs";

export interface OrderBookData {
  bidUnits: number | null;
  price: number;
  askUnits: number | null;
  isHighlighted?: boolean;
  highlightColor?: "red" | "green";
  isLastHashprice?: boolean;
}

type HashrateIndexData = {
  id: number;
  updatedAt: string;
  updatedAtDate: Date;
  priceToken: bigint;
  priceBTC: bigint;
};

/**
 * Creates the final order book data by merging live order book data with calculated static data
 * @param orderBookData - Live order book data from the API
 * @param hashrateData - Hashrate index data to calculate base prices
 * @param contractSpecs - Contract specifications including price ladder step
 * @returns Final merged and sorted order book data
 */
export const createFinalOrderBookData = (
  orderBookData: OrderBookOrder[],
  hashrateData: HashrateIndexData[] | undefined,
  contractSpecs: FuturesContractSpecs | undefined,
): OrderBookData[] => {
  // Calculate minimumPriceIncrement once for reuse
  const minimumPriceIncrement = contractSpecs ? Number(contractSpecs.minimumPriceIncrement) / 1e6 : null; // Convert from wei to USDC

  // Calculate basePrice from newest hashprice (used for highlighting and calculating order book)
  let basePrice: number | null = null;
  if (hashrateData && hashrateData.length > 0 && minimumPriceIncrement !== null) {
    // Get the newest item by date (last item in the array since it's ordered by updatedAt asc)
    const newestItem = hashrateData[0];
    if (newestItem && newestItem.priceToken) {
      const rawPrice = Number(newestItem.priceToken) / 1e6; // Convert from wei to USDC
      // Round to the nearest multiple of minimumPriceIncrement
      basePrice = Math.round(rawPrice / minimumPriceIncrement) * minimumPriceIncrement;
    }
  }

  // Calculate static order book data based on hashrate
  let calculatedOrderBookData: { price: number; bidUnits: number | null; askUnits: number | null }[] = [];
  const offsetAroundBasePrice = 100;

  if (basePrice !== null && minimumPriceIncrement !== null) {
    const staticOrderBookRows = [];

    // Create 10 items before the base price
    for (let i = offsetAroundBasePrice; i >= 1; i--) {
      const price = basePrice - i * minimumPriceIncrement;
      staticOrderBookRows.push({
        price: price,
        bidUnits: null,
        askUnits: null,
      });
    }

    // Add the base price
    staticOrderBookRows.push({
      price: basePrice,
      bidUnits: null,
      askUnits: null,
    });

    // Create 10 items after the base price
    for (let i = 1; i <= offsetAroundBasePrice; i++) {
      const price = basePrice + i * minimumPriceIncrement;
      staticOrderBookRows.push({
        price: price,
        bidUnits: null,
        askUnits: null,
      });
    }

    calculatedOrderBookData = staticOrderBookRows;
  }

  // Group fetched order book by price and side
  const liveGroupedMap = new Map<number, { bidUnits: number | null; askUnits: number | null }>();

  if (orderBookData && orderBookData.length > 0) {
    const priceToSideCount = new Map<number, { bids: number; asks: number }>();

    for (const order of orderBookData) {
      const price = Math.round((Number(order.pricePerDay) / 1e6) * 100) / 100; // USDC with 2 decimals
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

  // Start merged map with calculated data (so calculated-only prices are kept)
  const mergedMap = new Map<number, { bidUnits: number | null; askUnits: number | null }>();
  if (calculatedOrderBookData && calculatedOrderBookData.length > 0) {
    for (const row of calculatedOrderBookData) {
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

  // Build final array sorted by price asc (lower prices on top)
  return Array.from(mergedMap.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([price, v]) => ({
      price,
      bidUnits: v.bidUnits,
      askUnits: v.askUnits,
      isLastHashprice: price == basePrice, // Allow small floating point differences
    }));
};
