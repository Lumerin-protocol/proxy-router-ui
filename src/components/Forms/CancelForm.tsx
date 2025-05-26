import { useAccount, usePublicClient } from "wagmi";
import type { EthereumGateway } from "../../gateway/ethereum";
import { waitForBlockNumber } from "../../hooks/data/useContracts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { colors } from "../../styles/styles.config";
import { useQueryClient } from "@tanstack/react-query";
import { TransactionForm } from "./MultistepForm";
import type { TransactionReceipt } from "viem";

export interface CancelFormProps {
  contractId: string;
  web3Gateway?: EthereumGateway;
  closeForm: () => void;
}

export const CancelForm: React.FC<CancelFormProps> = ({ contractId, web3Gateway, closeForm }) => {
  const { address: userAccount } = useAccount();
  const qc = useQueryClient();
  const publicClient = usePublicClient();

  return (
    <TransactionForm
      onCancel={closeForm}
      client={publicClient!}
      title="Cancel purchase"
      description="You are about to cancel your purchase. The hashpower will no longer be delivered."
      reviewForm={(props) => <></>}
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
            const receipt = await web3Gateway!.closeContract({
              contractAddress: contractId,
              from: userAccount!,
            });
            return receipt.txHash!;
          },
          postConfirmation: async (receipt: TransactionReceipt) => {
            await waitForBlockNumber(receipt.blockNumber, qc);
          },
        },
      ]}
    />
  );
};
