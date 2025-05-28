import { useForm } from "react-hook-form";
import { useAccount, usePublicClient } from "wagmi";
import type { EthereumGateway } from "../../gateway/ethereum";
import type { HashRentalContract } from "../../types/types";
import { GenericConfirmContent } from "./Shared/GenericConfirmContent";
import { CreateEditContractForm } from "./Shared/CreateEditContractForm";
import type { InputValuesCreateForm } from "./CreateForm";
import { useQueryClient } from "@tanstack/react-query";
import { waitForBlockNumber } from "../../hooks/data/useContracts";
import { TransactionForm } from "./Shared/MultistepForm";
import type { TransactionReceipt } from "viem";
import { truncateAddress } from "../../utils/utils";
import { GenericCompletedContent } from "./Shared/GenericCompletedContent";
import { memo } from "react";

export interface EditFormProps {
  contract: HashRentalContract;
  web3Gateway: EthereumGateway;
  closeForm: () => void;
}

export const EditForm: React.FC<EditFormProps> = memo(
  ({ web3Gateway, contract, closeForm }) => {
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

    return (
      <TransactionForm
        onCancel={closeForm}
        client={publicClient!}
        title="Edit Hashrate contract"
        description="Edit the terms of your Hashrate contract"
        inputForm={(props) => <CreateEditContractForm form={form} />}
        validateInput={async () => {
          return await form.trigger();
        }}
        reviewForm={(props) => (
          <GenericConfirmContent
            data={{
              "Wallet Address": truncateAddress(form.getValues().walletAddress),
              "Contract Duration": `${form.getValues().durationHours} hours`,
              Speed: `${form.getValues().speedTHPS} THPS`,
              "Profit Target": `${form.getValues().profitTargetPercent}%`,
            }}
          />
        )}
        resultForm={(props) => <GenericCompletedContent title="Your hashrate contract terms have been updated" />}
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
    return prevProps.contract.id === nextProps.contract.id;
  },
);

// EditForm.whyDidYouRender = true;
