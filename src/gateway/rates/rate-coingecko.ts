import type { Rates } from "./interfaces";

/**
 * Returns ETH and LMR prices in USD from coingecko api
 */
export const getRateCoingecko = async (): Promise<Rates> => {
  const baseUrl = "https://api.coingecko.com/api";
  const searchParams = new URLSearchParams();
  searchParams.append("ids", "ethereum,lumerin,bitcoin");
  searchParams.append("vs_currencies", "usd");

  const res = await fetch(`${baseUrl}/v3/simple/price?${searchParams.toString()}`);
  const data = await res.json();

  const LMR = data?.lumerin?.usd;
  const ETH = data?.ethereum?.usd;
  const BTC = data?.bitcoin?.usd;

  if (!LMR || !ETH || !BTC) {
    throw new Error(`invalid price response from coingecko: ${data}`);
  }
  return { LMR, ETH, BTC };
};
