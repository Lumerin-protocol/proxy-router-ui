import { useWalletClient } from "wagmi";
import { waitForTransactionReceipt, type WaitForTransactionReceiptParameters } from "viem/actions";

/**
 * Enables using waitForTransactionReceipt with wallet client tranport
 *
 * Sometimes when calling transactions that depend on ERC20 approve fail
 * because the wallet client node state hasn't been updated yet
 */
export function useCustomWalletClient() {
  const wc = useWalletClient();

  return wc.data?.extend((client) => {
    return {
      waitForTransactionReceipt: (args: WaitForTransactionReceiptParameters) => waitForTransactionReceipt(client, args),
    };
  });
}
