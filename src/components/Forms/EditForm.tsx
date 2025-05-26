import { useForm } from "react-hook-form";
import { useAccount, usePublicClient } from "wagmi";
import type { EthereumGateway } from "../../gateway/ethereum";
import { ContentState, type HashRentalContract } from "../../types/types";
import { CompletedContent } from "./SellerForms/CompletedContent";
import { ConfirmContent } from "./SellerForms/ConfirmContent";
import { ReviewContent } from "./SellerForms/ReviewContent";
import type { InputValuesCreateForm } from "./CreateForm";
import { useQueryClient } from "@tanstack/react-query";
import { waitForBlockNumber } from "../../hooks/data/useContracts";
import { TransactionForm } from "./MultistepForm";
import type { TransactionReceipt } from "viem";

export interface EditFormProps {
  contract: HashRentalContract;
  web3Gateway: EthereumGateway;
  closeForm: () => void;
}

export const EditForm: React.FC<EditFormProps> = ({ web3Gateway, contract, closeForm }) => {
  const { address: userAccount } = useAccount();
  const qc = useQueryClient();
  const publicClient = usePublicClient();

  // Input validation setup
  const form = useForm<InputValuesCreateForm>({
    mode: "onBlur",
    defaultValues: {
      walletAddress: contract.seller,
      durationHours: Number.parseInt(contract.length) / 3600,
      speedTHPS: Number.parseInt(contract.speed) / 10 ** 12,
      profitTargetPercent: Number(contract.profitTargetPercent),
    },
  });

  const {
    handleSubmit,
    formState: { isValid, isDirty },
  } = form;

  return (
    <TransactionForm
      onCancel={closeForm}
      client={publicClient!}
      title="Edit Hashrate contract"
      description="Edit the terms of your Hashrate contract"
      inputForm={(props) => <ReviewContent form={form} isCreate />}
      validateInput={async () => {
        return await form.trigger();
      }}
      reviewForm={(props) => <ConfirmContent data={form.getValues()} />}
      resultForm={(props) => <CompletedContent contentState={ContentState.Complete} />}
      transactionSteps={[
        {
          label: "Edit Hashrate Contract",
          action: async () => {
            const data = form.getValues();

            const durationSeconds = Number(data.durationHours) * 3600;
            const speedHPS = Number(data.speedTHPS) * 10 ** 12;

            const receipt = await web3Gateway.editContractTerms({
              contractAddress: contract.id,
              profitTargetPercent: BigInt(data.profitTargetPercent),
              speedHPS: BigInt(speedHPS),
              durationSeconds: BigInt(durationSeconds),
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
