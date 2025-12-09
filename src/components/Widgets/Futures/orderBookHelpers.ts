import type { AggregateOrderBookOrder } from "../../../hooks/data/useAggregateOrderBook";
import type { FuturesContractSpecs } from "../../../hooks/data/useFuturesContractSpecs";

export interface OrderBookData {
  bidUnits: number | null;
  price: number;
  askUnits: number | null;
  isHighlighted?: boolean;
  highlightColor?: "red" | "green";
  isLastHashprice?: boolean;
}

/**
 * Creates the final order book data by merging live aggregated order book data with calculated static data
 * @param orderBookData - Pre-aggregated order book data from the API (already has buyOrdersCount and sellOrdersCount)
 * @param marketPrice - Market price from the Futures contract
 * @param contractSpecs - Contract specifications including price ladder step
 * @returns Final merged and sorted order book data
 */
export const createFinalOrderBookData = (
  orderBookData: AggregateOrderBookOrder[],
  marketPrice: bigint | null | undefined,
  contractSpecs: FuturesContractSpecs | undefined,
): OrderBookData[] => {
  // Calculate minimumPriceIncrement once for reuse
  const minimumPriceIncrement = contractSpecs ? Number(contractSpecs.minimumPriceIncrement) / 1e6 : null; // Convert from wei to USDC

  // Calculate basePrice from market price (used for highlighting and calculating order book)
  let basePrice: number | null = null;
  if (marketPrice && minimumPriceIncrement !== null) {
    const rawPrice = Number(marketPrice) / 1e6; // Convert from wei to USDC
    // Round to the nearest multiple of minimumPriceIncrement
    basePrice = Math.round(rawPrice / minimumPriceIncrement) * minimumPriceIncrement;
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

  // Helper function to normalize price to consistent precision
  // If minimumPriceIncrement is available, round to nearest multiple
  // Otherwise, round to 2 decimal places
  const normalizePrice = (price: number): number => {
    if (minimumPriceIncrement !== null) {
      // Round to nearest multiple of minimumPriceIncrement to match calculated prices
      return Math.round(price / minimumPriceIncrement) * minimumPriceIncrement;
    }
    // Fallback to 2 decimal places
    return Math.round(price * 100) / 100;
  };

  // Use pre-aggregated data directly - no need to group by price/side since it's already aggregated
  const liveGroupedMap = new Map<number, { bidUnits: number | null; askUnits: number | null }>();

  if (orderBookData && orderBookData.length > 0) {
    for (const order of orderBookData) {
      const rawPrice = Number(order.price) / 1e6; // Convert from wei to USDC
      const price = normalizePrice(rawPrice); // Normalize to consistent precision

      // Data is already aggregated with buyOrdersCount and sellOrdersCount
      liveGroupedMap.set(price, {
        bidUnits: order.buyOrdersCount > 0 ? order.buyOrdersCount : null,
        askUnits: order.sellOrdersCount > 0 ? order.sellOrdersCount : null,
      });
    }
  }

  // Start merged map with calculated data (so calculated-only prices are kept)
  // Normalize calculated prices to ensure consistency
  const mergedMap = new Map<number, { bidUnits: number | null; askUnits: number | null }>();
  if (calculatedOrderBookData && calculatedOrderBookData.length > 0) {
    for (const row of calculatedOrderBookData) {
      const normalizedPrice = normalizePrice(row.price);
      mergedMap.set(normalizedPrice, { bidUnits: row.bidUnits, askUnits: row.askUnits });
    }
  }

  // Overlay live data ensuring all live prices are present and preferred
  // Live prices are already normalized, so they should match calculated prices
  for (const [price, live] of liveGroupedMap.entries()) {
    const existing = mergedMap.get(price);
    if (!existing) {
      mergedMap.set(price, { bidUnits: live.bidUnits, askUnits: live.askUnits });
    } else {
      // Merge: prefer live data if available, otherwise keep existing
      mergedMap.set(price, {
        bidUnits: live.bidUnits !== null ? live.bidUnits : existing.bidUnits,
        askUnits: live.askUnits !== null ? live.askUnits : existing.askUnits,
      });
    }
  }

  // Build final array sorted by price desc (higher prices on top)
  // Normalize prices in final output to ensure consistency
  return Array.from(mergedMap.entries())
    .sort((a, b) => b[0] - a[0])
    .map(([price, v]) => {
      const normalizedPrice = normalizePrice(price);
      return {
        price: normalizedPrice,
        bidUnits: v.bidUnits,
        askUnits: v.askUnits,
        isLastHashprice: normalizedPrice === (basePrice !== null ? normalizePrice(basePrice) : null),
      };
    });
};
