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
    const { setContractsDeletedAsync } = useSetContractsDeleted();

    return (
      <TransactionForm
        onClose={closeForm}
        title={`${isArchived ? "Unarchive" : "Archive"} contract`}
        description={""}
        reviewForm={(props) => (
          <>
            <p className="mb-4">You are about to {isArchived ? "unarchive" : "archive"} following contracts:</p>
            <ul className="mb-4">
              {contractIds.map((contractId) => (
                <li key={contractId}>
                  <p>{contractId}</p>
                </li>
              ))}
            </ul>
            <p className="mb-2">
              {isArchived
                ? "These conracts will be available for purchase"
                : "These contracts will not be available for purchase. You will be able to unarchive them at any time."}
            </p>
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
