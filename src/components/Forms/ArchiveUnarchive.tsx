import { useAccount, usePublicClient } from "wagmi";
import type { FC } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { EthereumGateway } from "../../gateway/ethereum";
import { ContentState } from "../../types/types";
import { waitForBlockNumber } from "../../hooks/data/useContracts";
import { TransactionForm } from "./MultistepForm";
import type { TransactionReceipt } from "viem";
import { CompletedContent } from "./SellerForms/CompletedContent";

interface Props {
  contractIds: string[];
  web3Gateway?: EthereumGateway;
  isArchived: boolean;
  closeForm: () => void;
}

export const ArchiveUnarchiveForm: FC<Props> = ({ contractIds, web3Gateway, isArchived, closeForm }) => {
  const { address: userAccount } = useAccount();
  const qc = useQueryClient();
  const publicClient = usePublicClient();

  return (
    <TransactionForm
      onCancel={closeForm}
      client={publicClient!}
      title="Archive contract"
      description={`You are about to ${isArchived ? "unarchive" : "archive"} following contracts:`}
      reviewForm={(props) => (
        <>
          {contractIds.map((contractId) => (
            <div key={contractId}>
              <p>{contractId}</p>
            </div>
          ))}
        </>
      )}
      resultForm={(props) => <CompletedContent contentState={ContentState.Complete} />}
      transactionSteps={[
        {
          label: `${isArchived ? "Unarchive" : "Archive"} contract`,
          action: async () => {
            const receipt = await web3Gateway!.setContractsDeleted(
              contractIds as `0x${string}`[],
              !isArchived,
              userAccount!,
            );
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
