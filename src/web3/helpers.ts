import { EthereumGateway } from "../gateway/ethereum";
import lumerin from "../images/lumerin_metamask.png";
import { type ConnectInfo, WalletText } from "../types/types";
import { printError } from "../utils/utils";

interface Web3Result {
  web3Gateway: EthereumGateway;
  accounts: string[];
}

const ethereum = window.ethereum;

// Get accounts, web3 and contract instances
export const getWeb3ResultAsync = async (
  onConnect: (info: ConnectInfo) => void,
  onDisconnect: (err: Error) => void,
  onChainChange: (chainId: string, pr: provider) => void,
  onAccountsChange: (accounts: string[]) => void,
  walletName: string
): Promise<Web3Result | null> => {
  try {
    const provider = await getProviderAsync(walletName);

    if (!provider) {
      console.error("Missing provider");
      return null;
    }

    if (typeof provider === "string") {
      console.error("Invalid string provider", provider);
      return null;
    }

    if (walletName === WalletText.ConnectViaMetaMask) {
      ethereum.on("connect", onConnect);
      ethereum.on("disconnect", onDisconnect);
      ethereum.on("chainChanged", (chainID: string) => onChainChange(chainID, ethereum));
      ethereum.on("accountsChanged", onAccountsChange);
      await ethereum.request({ method: "eth_requestAccounts" });
      console.log("after request accounts");
    } else {
      provider.on("disconnect", onDisconnect);
      provider.on("chainChanged", onChainChange);
      provider.on("accountsChanged", onAccountsChange);
      await WalletConnectProvider.enable();
    }

    const web3Gateway = new EthereumGateway(
      process.env.REACT_APP_CLONE_FACTORY!,
      process.env.REACT_APP_INDEXER_URL!
    );
    await web3Gateway.init();

    return { web3Gateway, accounts: await web3Gateway.getAccounts() };
  } catch (error) {
    const typedError = error as Error;
    printError(typedError.message, typedError.stack as string);
    return null;
  }
};

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
