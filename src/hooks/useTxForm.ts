import { type FC, type ReactNode, useState } from "react";
import type { PublicClient, TransactionReceipt } from "viem";
import { usePublicClient } from "wagmi";

export type TransactionStep = {
  label: string;
  action: () => Promise<string | undefined>;
  postConfirmation?: (receipt: TransactionReceipt) => Promise<void>;
};

export type TxState = {
  state: "pending" | "sending" | "sent" | "confirmed" | "failed" | "skipped";
  error?: Error;
  txhash?: `0x${string}`;
};

export function useMultistepTx(props: { steps: TransactionStep[]; client: PublicClient }) {
  const client = usePublicClient();

  const [txState, setTxState] = useState(() => {
    return props.steps.reduce<Record<number, TxState>>((acc, _, index) => {
      acc[index] = { state: "pending", txhash: undefined };
      return acc;
    }, {});
  });

  const executeNextTransaction = async (txNumber: number) => {
    try {
      const tx = props.steps[txNumber].action();
      setTxState((prev) => ({ ...prev, [txNumber]: { state: "sending" } }));

      const txhash = await tx;
      setTxState((prev) => ({
        ...prev,
        [txNumber]: { state: "sent", txhash: txhash as `0x${string}` },
      }));

      try {
        if (txhash) {
          const receipt = await client!.waitForTransactionReceipt({
            hash: txhash as `0x${string}`,
          });
          console.log("receipt", receipt);
          setTxState((prev) => ({
            ...prev,
            [txNumber]: {
              state: receipt.status === "success" ? "confirmed" : "failed",
              txhash: txhash as `0x${string}`,
            },
          }));
          if (props.steps[txNumber].postConfirmation) {
            await props.steps[txNumber].postConfirmation(receipt);
          }
        } else {
          setTxState((prev) => ({ ...prev, [txNumber]: { state: "skipped" } }));
        }
        return true;
      } catch (error) {
        console.error(error);
        setTxState((prev) => ({ ...prev, [txNumber]: { state: "failed", error: error as Error } }));
        return false;
      }
    } catch (error) {
      console.error(error);
      setTxState((prev) => ({ ...prev, [txNumber]: { state: "failed", error: error as Error } }));
      return false;
    }
  };

  return {
    txState,
    executeNextTransaction,
  };
}
