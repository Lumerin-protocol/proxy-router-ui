import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { colors } from "../../styles/styles.config";
import { useQueryClient } from "@tanstack/react-query";
import { TransactionForm } from "./MultistepForm";
import { validatorRegistryAbi } from "contracts-js/dist/abi/abi";

export interface CancelFormProps {
  closeForm: () => void;
}

export const DeregisterValidator: React.FC<CancelFormProps> = ({ closeForm }) => {
  const { address: userAccount } = useAccount();
  const publicClient = usePublicClient();
  const wc = useWalletClient();

  return (
    <TransactionForm
      onCancel={closeForm}
      client={publicClient!}
      title="Deregister yourself as a validator"
      description="You are about to deregister yourself as a validator, and your validator will no longer be
            active. Your stake will be returned to your account."
      reviewForm={(props) => (
        <>
          <p className="mb-2">Make sure you want to deregister yourself as a validator.</p>
          <p>The deregistration is permanent.</p>
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
          label: "Remove yourself as a validator",
          action: async () => {
            const req = await publicClient!.simulateContract({
              address: process.env.REACT_APP_VALIDATOR_REGISTRY_ADDRESS as `0x${string}`,
              abi: validatorRegistryAbi,
              functionName: "validatorDeregister",
              account: userAccount!,
            });
            return await wc.data!.writeContract(req.request);
          },
        },
      ]}
    />
  );
};
