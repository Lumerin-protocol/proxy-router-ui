import { parseUnits } from "viem";
import { formatUnits } from "./formatUnits";

type Unit = {
  decimals: number;
  symbol: string;
  name: string;
};

type Value = {
  value: string;
  valueRounded: string;
  symbol: string;
  name: string;
  full: string;
};

const usdcToken: Unit = {
  decimals: 6,
  symbol: "USDC",
  name: "USDC Coin",
} as const;

const lmrToken: Unit = {
  decimals: 8,
  symbol: "LMR",
  name: "Lumerin",
} as const;

const ethToken: Unit = {
  decimals: 18,
  symbol: "ETH",
  name: "Ethereum",
} as const;

export const paymentToken = usdcToken;
export const feeToken = lmrToken;
export const validatorStakeToken = lmrToken;
export const sellerStakeToken = lmrToken;
export const gasToken = ethToken;

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

export const formatHashrateTHPS = (speedHashPerSecond: string | bigint): Value => {
  return formatValue(speedHashPerSecond, terahashPerSecond);
};

export const formatValidatorStake = (stakeUnits: string | bigint): Value => {
  return formatValue(stakeUnits, validatorStakeToken);
};

export const parseValidatorStake = (stakeUnits: string): bigint => {
  return parseUnits(stakeUnits, validatorStakeToken.decimals);
};

export const formatValue = (units: string | bigint, token: Unit) => {
  const { full, unrounded } = formatUnits(BigInt(units), token.decimals, {
    maxChars: 5,
  });
  return {
    value: unrounded,
    valueRounded: full,
    symbol: token.symbol,
    name: token.name,
    full: `${full} ${token.symbol}`,
  };
};

export function limitSignificantDecimals(value: string, significantDecimals: number) {
  const [integer, decimal = ""] = value.split(".");
  if (decimal.length < significantDecimals) {
    return value;
  }
  const decimals = decimal.split("");
  const firstNonZero = decimals.findIndex((d) => d !== "0");
  const lastNonZero = decimals.findLastIndex((d) => d !== "0");
  const significantNumbers = decimals.slice(firstNonZero, lastNonZero + 1);
  const trimmed = (Number(significantNumbers.join("")) / 10 ** significantNumbers.length) * 10 ** significantDecimals;
  const roundedSignificantPart = Math.floor(trimmed);
  const out = `${integer}.${"0".repeat(firstNonZero)}${roundedSignificantPart}`;
  return out;
}

// used to format float values with a currency symbol
export const formatCurrency: (param: {
  value: number;
  currency: string | undefined;
  maxSignificantFractionDigits: number;
}) => string = ({ value, currency, maxSignificantFractionDigits }) => {
  let style = "currency" as "currency" | "decimal";

  if (!currency) {
    currency = undefined;
    style = "decimal";
  }

  if (maxSignificantFractionDigits === 0) {
    return Math.floor(value).toString();
  }

  if (value < 1) {
    return new Intl.NumberFormat(navigator.language, {
      style: style,
      currency: currency,
      maximumSignificantDigits: maxSignificantFractionDigits,
    }).format(value);
  }

  const integerDigits = value.toFixed(0).toString().length;
  let fractionDigits = maxSignificantFractionDigits - integerDigits;
  if (fractionDigits < 0) {
    fractionDigits = 0;
  }

  return new Intl.NumberFormat(navigator.language, {
    style: style,
    currency: currency,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
};
