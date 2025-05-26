import { EthereumGateway } from "../gateway/ethereum";
import lumerin from "../images/lumerin_metamask.png";
import { type ConnectInfo, WalletText } from "../types/types";
import { printError } from "../utils/utils";

interface Web3Result {
  web3Gateway: EthereumGateway;
  accounts: string[];
}

const ethereum = window.ethereum;

// Wallet helpers
// Allows user choose which account they want to use in MetaMask
export const reconnectWalletAsync: () => void = async () => {
  await ethereum?.request({
    method: "wallet_requestPermissions",
    params: [
      {
        eth_accounts: {},
      },
    ],
  });
};

export const multiplyByDigits: (amount: number) => number = (amount) => {
  return amount * 10 ** 8;
};

export const divideByDigits: (amount: number) => number = (amount) => {
  return Number.parseInt(String(amount / 10 ** 8));
};

const LMRDecimal = 8;
const ETHDecimal = 18;

export const LMRDecimalToLMR = (decimal: number): number => {
  return decimal / 10 ** LMRDecimal;
};

export const ETHDecimalToETH = (decimal: number): number => {
  return decimal / 10 ** ETHDecimal;
};

export const USDCDecimalToUSDC = (decimal: number): number => {
  return decimal / 10 ** 6;
};

// Convert integer provided as number, BigInt or decimal string to hex string with prefix '0x'
export const intToHex = (value: number | bigint | string) => {
  if (typeof value === "string") {
    value = Number(value);
  }
  return "0x" + value.toString(16);
};

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
