import { useAccount, usePublicClient } from "wagmi";
import { waitForBlockNumber } from "../../hooks/data/useContracts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons/faCheckCircle";
import { colors } from "../../styles/styles.config";
import { useQueryClient } from "@tanstack/react-query";
import { TransactionForm } from "./Shared/MultistepForm";
import type { TransactionReceipt } from "viem";
import type { FC } from "react";
import { useClaimFundsBatch } from "../../hooks/data/useClaimFundsBatch";

interface Props {
  contractIDs: `0x${string}`[];
  closeForm: () => void;
}

export const ClaimForm: FC<Props> = ({ contractIDs, closeForm }) => {
  const { address: userAccount } = useAccount();
  const qc = useQueryClient();
  const pc = usePublicClient();
  const { claimFundsBatchAsync } = useClaimFundsBatch();

  return (
    <TransactionForm
      onClose={closeForm}
      client={pc!}
      title="Claim rewards"
      description="This action will allow you to manually claim unpaid rewards for the contracts that run to completion. Remember that the same action will be performed automatically on the next purchase of the same contract."
      reviewForm={(props) => (
        <>
          You are about to claim rewards for the following contracts:
          {contractIDs.map((c) => (
            <p key={c}>{c}</p>
          ))}
        </>
      )}
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
