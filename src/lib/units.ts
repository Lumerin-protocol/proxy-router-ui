import { formatUnits } from "viem";

type Unit = {
  decimals: number;
  symbol: string;
  name: string;
};

type Value = {
  value: string;
  symbol: string;
  name: string;
  full: string;
};

const paymentToken: Unit = {
  decimals: 6,
  symbol: "USDC",
  name: "USDC Coin",
} as const;

const feeToken: Unit = {
  decimals: 8,
  symbol: "LMR",
  name: "Lumerin",
} as const;

const terahashPerSecond: Unit = {
  decimals: 12,
  symbol: "TH/s",
  name: "Terahash per second",
} as const;

export const formatPaymentPrice = (priceUnits: string | bigint): Value => {
  return formatValue(priceUnits, paymentToken);
};

export const formatFeePrice = (priceUnits: string | bigint): Value => {
  return formatValue(priceUnits, feeToken);
};

export const formatTHPS = (speedHashPerSecond: string | bigint): Value => {
  return formatValue(speedHashPerSecond, terahashPerSecond);
};

const formatValue = (units: string | bigint, token: Unit) => {
  const value = _formatValue(units, token.decimals);
  return {
    value,
    symbol: token.symbol,
    name: token.name,
    full: `${value} ${token.symbol}`,
  };
};

const _formatValue = (units: string | bigint, decimals: number) => {
  if (units === undefined || units === null) {
    return "…";
  }
  return limitSignificantDecimals(formatUnits(BigInt(units), decimals), 3);
};

function limitSignificantDecimals(value: string, significantDecimals: number) {
  const [integer, decimal = ""] = value.split(".");
  if (decimal.length < significantDecimals) {
    return value;
  }
  const decimals = decimal.split("");
  const firstNonZero = decimals.findIndex((d) => d !== "0");
  const lastNonZero = decimals.findLastIndex((d) => d !== "0");
  const significantNumbers = decimals.slice(firstNonZero, lastNonZero + 1);
  const trimmed =
    (Number(significantNumbers.join("")) / 10 ** significantNumbers.length) *
    10 ** significantDecimals;
  const roundedSignificantPart = Math.round(trimmed);
  const out = `${integer}.${"0".repeat(firstNonZero)}${roundedSignificantPart}`;
  return out;
}
