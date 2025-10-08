import { useReadContracts } from "wagmi";
import { erc20Abi } from "viem";
import { useFeeTokenAddress } from "./useFeeTokenBalance";

// Static token addresses for LMR balance validation
const staticTokens = [
  "0x4b1d0b9f081468d780ca1d5d79132b64301085d1", // ETH
  "0x0FC0c323Cf76E188654D63D62e668caBeC7a525b", // ARB
];

interface TokenBalance {
  tokenAddress: string;
  balance: bigint;
  isSuccess: boolean;
  isLoading: boolean;
  error?: Error;
}

interface LmrBalanceValidationResult {
  balances: TokenBalance[];
  totalBalance: bigint;
  hasAnyBalance: boolean;
  isLoading: boolean;
  isSuccess: boolean;
}

export function useLmrBalanceValidation(address: `0x${string}` | undefined): LmrBalanceValidationResult {
  const { data: feeTokenAddress } = useFeeTokenAddress();

  // Merge static tokens with fee token address and make distinct
  const allTokens = [...staticTokens, ...(feeTokenAddress ? [feeTokenAddress] : [])];
  const tokens = [...new Set(allTokens)];

  // Create contracts array for useReadContracts
  const contracts = tokens.map((tokenAddress) => ({
    address: tokenAddress as `0x${string}`,
    abi: erc20Abi,
    functionName: "balanceOf" as const,
    args: [address!],
  }));

  // Single useReadContracts call
  const {
    data: results,
    isLoading,
    isSuccess,
  } = useReadContracts({
    contracts,
    query: {
      enabled: !!address,
    },
  });

  // Aggregate results
  const balances: TokenBalance[] = tokens.map((tokenAddress, index) => {
    const result = results?.[index];
    const rawBalance = result?.result ?? 0n;
    const adjustedBalance = rawBalance / 10n ** 8n;
    return {
      tokenAddress,
      balance: adjustedBalance,
      isSuccess: result?.status === "success",
      isLoading: isLoading,
      error: result?.error || undefined,
    };
  });

  // Calculate total balance
  const totalBalance = balances.reduce((sum, token) => {
    return sum + (token.balance ?? 0n);
  }, 0n);

  // Check if any token has balance
  const hasAnyBalance = balances.some((token) => token.balance > 0n);

  return {
    balances,
    totalBalance,
    hasAnyBalance,
    isLoading,
    isSuccess,
  };
}
