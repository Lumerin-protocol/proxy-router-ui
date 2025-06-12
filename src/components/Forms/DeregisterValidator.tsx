import type { FC } from "react";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons/faCheckCircle";
import { colors } from "../../styles/styles.config";
import { TransactionForm } from "./Shared/MultistepForm";
import { validatorRegistryAbi } from "contracts-js/dist/abi/abi";

export interface CancelFormProps {
  closeForm: () => void;
}

export const DeregisterValidator: FC<CancelFormProps> = ({ closeForm }) => {
  const { address: userAccount } = useAccount();
  const publicClient = usePublicClient();
  const wc = useWalletClient();

  return (
    <TransactionForm
      onClose={closeForm}
      title="Deregister yourself as a validator"
      description="You are about to deregister yourself as a Validator."
      reviewForm={(props) => (
        <p className="mt-2">Your validator will no longer be active. Your stake will be returned to your account.</p>
      )}
      resultForm={(props) => (
        <>
          <FontAwesomeIcon className="mb-8" icon={faCheckCircle} size="5x" color={colors["lumerin-aqua"]} />
          <h2 className="w-6/6 text-left font-semibold mb-3">The order has been cancelled successfully.</h2>
          <p className="w-6/6 text-left font-normal text-s">The status of the order will update shortly.</p>
        </>
      )}
      transactionSteps={[
        {
          label: "Remove yourself as a validator",
          action: async () => {
            const req = await publicClient!.simulateContract({
              address: process.env.REACT_APP_VALIDATOR_REGISTRY_ADDRESS as `0x${string}`,
              abi: validatorRegistryAbi,
              functionName: "validatorDeregister",
              account: userAccount!,
            });
            const txhash = await wc.data!.writeContract(req.request);
            return {
              isSkipped: false,
              txhash: txhash,
            };
          },
        },
      ]}
    />
  );
};
