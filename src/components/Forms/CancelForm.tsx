import { usePublicClient } from "wagmi";
import { waitForBlockNumber } from "../../hooks/data/useContracts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons/faCheckCircle";
import { colors } from "../../styles/styles.config";
import { useQueryClient } from "@tanstack/react-query";
import { TransactionForm } from "./Shared/MultistepForm";
import type { TransactionReceipt } from "viem";
import { useCloseContract } from "../../hooks/data/useCloseContract";

export interface CancelFormProps {
  contractId: string;
  closeForm: () => void;
}

export const CancelForm: React.FC<CancelFormProps> = ({ contractId, closeForm }) => {
  const qc = useQueryClient();
  const { closeContractAsync } = useCloseContract();

  return (
    <TransactionForm
      onClose={closeForm}
      title="Cancel purchase"
      description=""
      reviewForm={(props) => <p>You are about to cancel your purchase. The hashpower will no longer be delivered</p>}
      resultForm={(props) => (
        <>
          <FontAwesomeIcon className="mb-8" icon={faCheckCircle} size="5x" color={colors["lumerin-aqua"]} />
          <h2 className="w-6/6 text-left font-semibold mb-3">The order has been cancelled successfully.</h2>
          <p className="w-6/6 text-left font-normal text-s">The status of the order will update shortly.</p>
          <br />
          {/* {txHash && (
            <a
              href={getTxUrl(txHash as `0x${string}`)}
              target="_blank"
              rel="noreferrer"
              className="font-light underline mb-4"
            >
              View Transaction: {truncateAddress(txHash, AddressLength.LONG)}
            </a>
          )} */}
        </>
      )}
      transactionSteps={[
        {
          label: "Cancel contract",
          action: async () => {
            const txhash = await closeContractAsync({
              contractAddress: contractId as `0x${string}`,
            });
            return { txhash, isSkipped: false };
          },
          postConfirmation: async (receipt: TransactionReceipt) => {
            await waitForBlockNumber(receipt.blockNumber, qc);
          },
        },
      ]}
    />
  );
};
