import { usePublicClient } from "wagmi";
import { waitForBlockNumber } from "../../hooks/data/useContracts";
import { useQueryClient } from "@tanstack/react-query";
import { TransactionForm } from "./Shared/MultistepForm";
import type { TransactionReceipt } from "viem";
import type { FC } from "react";
import { useClaimFundsBatch } from "../../hooks/data/useClaimFundsBatch";
import { truncateAddress } from "../../utils/formatters";
import { AddressLength } from "../../types/types";
import { getContractUrl } from "../../lib/indexer";
import { Alert } from "@mui/material";

interface Props {
  contractIDs: `0x${string}`[];
  closeForm: () => void;
}

export const ClaimForm: FC<Props> = ({ contractIDs, closeForm }) => {
  const qc = useQueryClient();
  const pc = usePublicClient();
  const { claimFundsBatchAsync } = useClaimFundsBatch();

  return (
    <TransactionForm
      onClose={closeForm}
      title="Claim rewards"
      description="This action will allow you to manually claim unpaid rewards for the contracts that run to completion."
      reviewForm={(props) => (
        <>
          <p className="mt-4">
            <Alert severity="info">
              <span className="font-semibold">Remember:</span> this action is performed automatically when these
              contracts are purchased again.
            </Alert>
          </p>
          <p className="mt-4 mb-2">You are about to claim rewards for the following contracts:</p>
          <ul className="list-disc list-inside mb-6">
            {contractIDs.map((c) => (
              <li key={c}>
                <a href={getContractUrl(c)} target="_blank" rel="noreferrer" className="underline">
                  {truncateAddress(c, AddressLength.LONG)}
                </a>
              </li>
            ))}
          </ul>
        </>
      )}
      transactionSteps={[
        {
          label: "Claim rewards",
          action: async () => {
            const txhash = await claimFundsBatchAsync({
              contractAddresses: contractIDs,
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
