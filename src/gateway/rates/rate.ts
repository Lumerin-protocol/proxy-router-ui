import type { Rates } from "./interfaces";
import { getRateCoingecko } from "./rate-coingecko";
import { getRateCoinpaprika } from "./rate-coinpaprika";
import { getRateKucoin } from "./rate-kucoin";

/**
 * Returns ETH and LMR prices in USD from exchanges api
 */
export const getRate = async (): Promise<Rates | undefined> => {
  const servicePriority = [getRateCoingecko, getRateCoinpaprika, getRateKucoin];

  for (const service of servicePriority) {
    try {
      const rates = await service();
      return rates;
    } catch (err) {
      console.error("Failed to get rate:", err);
    }
  }
};
