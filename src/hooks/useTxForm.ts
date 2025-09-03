import { useState } from "react";
import type { TransactionReceipt } from "viem";
import { useCustomWalletClient } from "./data/useCustomWalletClient";

export type TransactionStep = {
  label: string;
  action: () => Promise<ActionResult>;
  postConfirmation?: (receipt: TransactionReceipt) => Promise<void>;
};

export type ActionResult = { isSkipped: false; txhash?: `0x${string}` } | { isSkipped: true };

export type TxState = {
  state: "pending" | "sending" | "sent" | "confirmed" | "failed" | "skipped";
  error?: Error;
  txhash?: `0x${string}`;
};

export function useMultistepTx(props: { steps: TransactionStep[] }) {
  const wc = useCustomWalletClient();

  const [txState, setTxState] = useState(() => {
    return props.steps.reduce<Record<number, TxState>>((acc, _, index) => {
      acc[index] = { state: "pending", txhash: undefined };
      return acc;
    }, {});
  });
  const [currentStep, setCurrentStep] = useState(0);

  // error on any step makes the whole transaction fail
  const isError = Object.values(txState).some((state) => state.state === "failed");
  // success if the last step is confirmed or skipped
  const lastStepState = txState[props.steps.length - 1];
  const isSuccess = lastStepState.state === "confirmed" || lastStepState.state === "skipped";
  const isPending = !isSuccess && !isError;

  const executeNextTransaction = async (txNumber: number) => {
    try {
      const actionPromise = props.steps[txNumber].action();
      setTxState((prev) => ({ ...prev, [txNumber]: { state: "sending" } }));

      const actionResult = await actionPromise;
      setTxState((prev) => ({
        ...prev,
        [txNumber]: {
          state: "sent",
          txhash: actionResult.isSkipped ? undefined : actionResult.txhash,
        },
      }));

      try {
        if (!actionResult.isSkipped && actionResult.txhash) {
          const receipt = await wc!.waitForTransactionReceipt({
            hash: actionResult.txhash,
          });
          setTxState((prev) => ({
            ...prev,
            [txNumber]: {
              state: receipt.status === "success" ? "confirmed" : "failed",
              txhash: actionResult.txhash,
            },
          }));
          if (props.steps[txNumber].postConfirmation) {
            await props.steps[txNumber].postConfirmation(receipt);
          }
        } else if (actionResult.isSkipped) {
          setTxState((prev) => ({ ...prev, [txNumber]: { state: "skipped" } }));
        } else {
          setTxState((prev) => ({ ...prev, [txNumber]: { state: "confirmed" } }));
        }
        setCurrentStep((prev) => prev + 1);
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
    isSuccess,
    isError,
    isPending,
  };
}
