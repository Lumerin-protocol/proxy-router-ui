import { useAccount, usePublicClient } from "wagmi";
import type { EthereumGateway } from "../../gateway/ethereum";
import { waitForBlockNumber } from "../../hooks/data/useContracts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { colors } from "../../styles/styles.config";
import { useQueryClient } from "@tanstack/react-query";
import { TransactionForm } from "./Shared/MultistepForm";
import type { TransactionReceipt } from "viem";
import type { FC } from "react";

interface Props {
  contractIDs: `0x${string}`[];
  web3Gateway?: EthereumGateway;
  closeForm: () => void;
}

export const ClaimForm: FC<Props> = ({ contractIDs, web3Gateway, closeForm }) => {
  const { address: userAccount } = useAccount();
  const qc = useQueryClient();
  const pc = usePublicClient();

  return (
    <TransactionForm
      onCancel={closeForm}
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
            const receipt = await web3Gateway!.claimFundsBatch(contractIDs, userAccount!);
            return receipt.txHash ? { txhash: receipt.txHash, isSkipped: false } : { isSkipped: true };
          },
          postConfirmation: async (receipt: TransactionReceipt) => {
            await waitForBlockNumber(receipt.blockNumber, qc);
          },
        },
      ]}
    />
  );
};
