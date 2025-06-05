import { usePublicClient } from "wagmi";
import { memo, type FC } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { waitForBlockNumber } from "../../hooks/data/useContracts";
import { TransactionForm } from "./Shared/MultistepForm";
import type { TransactionReceipt } from "viem";
import isEqual from "react-fast-compare";
import { useSetContractsDeleted } from "../../hooks/data/useSetContractsDeleted";

interface Props {
  contractIds: string[];
  isArchived: boolean;
  closeForm: () => void;
}

export const ArchiveUnarchiveForm: FC<Props> = memo(
  ({ contractIds, isArchived, closeForm }) => {
    const qc = useQueryClient();
    const publicClient = usePublicClient();
    const { setContractsDeletedAsync } = useSetContractsDeleted();

    return (
      <TransactionForm
        onClose={closeForm}
        client={publicClient!}
        title={`${isArchived ? "Unarchive" : "Archive"} contract`}
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
              const txhash = await setContractsDeletedAsync({
                contractAddresses: contractIds as `0x${string}`[],
                isDeleted: !isArchived,
              });
              return {
                isSkipped: false,
                txhash: txhash,
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
