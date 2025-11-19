import { FuturesABI } from "../../abi/Futures";
import type { PublicClient } from "viem";

interface CalculateMinMarginProps {
  entryPricePerDay: bigint;
  quantity: number;
}

interface CalculateMinMarginForAddressProps {
  participantAddress: `0x${string}`;
}

export async function calculateMinMargin(publicClient: PublicClient, props: CalculateMinMarginProps): Promise<bigint> {
  const result = await publicClient.readContract({
    address: process.env.REACT_APP_FUTURES_TOKEN_ADDRESS as `0x${string}`,
    abi: FuturesABI,
    functionName: "getMinMarginForPosition",
    args: [props.entryPricePerDay, BigInt(props.quantity)],
  });

  return result as bigint;
}

export async function calculateMinMarginForAddress(
  publicClient: PublicClient,
  props: CalculateMinMarginForAddressProps,
): Promise<bigint> {
  const result = await publicClient.readContract({
    address: process.env.REACT_APP_FUTURES_TOKEN_ADDRESS as `0x${string}`,
    abi: FuturesABI,
    functionName: "getMinMargin",
    args: [props.participantAddress],
  });

  return result as bigint;
}
