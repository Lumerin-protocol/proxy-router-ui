import { useForm } from "react-hook-form";
import type { HashRentalContract } from "../../types/types";
import { GenericConfirmContent } from "./Shared/GenericConfirmContent";
import { CreateEditContractForm } from "./Shared/CreateEditContractForm";
import type { InputValuesCreateForm } from "./CreateForm";
import { useQueryClient } from "@tanstack/react-query";
import { waitForBlockNumber } from "../../hooks/data/useContracts";
import { TransactionForm } from "./Shared/MultistepForm";
import { isAddressEqual, type TransactionReceipt } from "viem";
import { truncateAddress } from "../../utils/formatters";
import { GenericCompletedContent } from "./Shared/GenericCompletedContent";
import { memo } from "react";
import { useEditContractTerms } from "../../hooks/data/useEditContractTerms";
import { useContractDurationInterval } from "../../hooks/data/useContractDurationInterval";

export interface EditFormProps {
  contract: HashRentalContract;
  closeForm: () => void;
}

export const EditForm: React.FC<EditFormProps> = memo(
  ({ contract, closeForm }) => {
    const qc = useQueryClient();
    const { editContractTermsAsync } = useEditContractTerms();

    const durationIntervalQuery = useContractDurationInterval();
    const durationIntervalHours = durationIntervalQuery.isSuccess
      ? ([Math.ceil(durationIntervalQuery.data[0] / 3600), Math.floor(durationIntervalQuery.data[1] / 3600)] as const)
      : ([0, 0] as const);

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

    return (
      <TransactionForm
        onClose={closeForm}
        title="Edit Hashrate contract"
        description="Edit the terms of your Hashrate contract"
        inputForm={() => <CreateEditContractForm form={form} durationIntervalHours={durationIntervalHours} />}
        validateInput={async () => {
          return await form.trigger();
        }}
        reviewForm={() => (
          <GenericConfirmContent
            data={{
              "Wallet Address": truncateAddress(form.getValues().walletAddress),
              "Contract Duration": `${form.getValues().durationHours} hours`,
              Speed: `${form.getValues().speedTHPS} THPS`,
              "Profit Target": `${form.getValues().profitTargetPercent}%`,
            }}
          />
        )}
        resultForm={() => <GenericCompletedContent title="Your hashrate contract terms have been updated" />}
        transactionSteps={[
          {
            label: "Edit Hashrate Contract",
            action: async () => {
              const data = form.getValues();

              const durationSeconds = Number(data.durationHours) * 3600;
              const speedHPS = Number(data.speedTHPS) * 10 ** 12;

              const txhash = await editContractTermsAsync({
                contractAddress: contract.id,
                profitTargetPercent: BigInt(data.profitTargetPercent),
                speedHPS: BigInt(speedHPS),
                durationSeconds: BigInt(durationSeconds),
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
    return isAddressEqual(prevProps.contract.id as `0x${string}`, nextProps.contract.id as `0x${string}`);
  },
);
