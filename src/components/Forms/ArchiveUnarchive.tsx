import { useAccount, usePublicClient } from "wagmi";
import { memo, type FC } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { EthereumGateway } from "../../gateway/ethereum";
import { waitForBlockNumber } from "../../hooks/data/useContracts";
import { TransactionForm } from "./Shared/MultistepForm";
import type { TransactionReceipt } from "viem";
import isEqual from "react-fast-compare";

interface Props {
  contractIds: string[];
  web3Gateway?: EthereumGateway;
  isArchived: boolean;
  closeForm: () => void;
}

export const ArchiveUnarchiveForm: FC<Props> = memo(
  ({ contractIds, web3Gateway, isArchived, closeForm }) => {
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
        transactionSteps={[
          {
            label: `${isArchived ? "Unarchive" : "Archive"} contract`,
            action: async () => {
              const receipt = await web3Gateway!.setContractsDeleted(
                contractIds as `0x${string}`[],
                !isArchived,
                userAccount!,
              );
              return {
                isSkipped: false,
                txhash: receipt.txHash,
              };
            },
            postConfirmation: async (receipt: TransactionReceipt) => {
              await waitForBlockNumber(receipt.blockNumber, qc);
            },
          },
        ]}
      />
    );
  },
  (prevProps, nextProps) => {
    return isEqual(prevProps.contractIds, nextProps.contractIds) && prevProps.isArchived === nextProps.isArchived;
  },
);
