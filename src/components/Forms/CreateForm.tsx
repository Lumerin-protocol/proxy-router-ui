import { useForm } from "react-hook-form";
import { useAccount } from "wagmi";
import { CompletedContent } from "./SellerForms/CompletedContent";
import { GenericConfirmContent } from "./Shared/GenericConfirmContent";
import { CreateEditContractForm } from "./Shared/CreateEditContractForm";
import { waitForBlockNumber } from "../../hooks/data/useContracts";
import { useQueryClient } from "@tanstack/react-query";
import { TransactionForm } from "./Shared/MultistepForm";
import type { TransactionReceipt } from "viem";
import { ContentState } from "../../types/types";
import { type FC, memo, useCallback, useRef } from "react";
import { truncateAddress } from "../../utils/formatters";
import { useGetPublicKey } from "../../hooks/data/usePublicKey";
import { useCreateNewRentalContract } from "../../hooks/data/useCreateNewRentalContract";
import { useContractDurationInterval } from "../../hooks/data/useContractDurationInterval";

export interface InputValuesCreateForm {
  walletAddress: string;
  durationHours: number | "";
  speedTHPS: number | "";
  profitTargetPercent: number | "";
}

interface CreateFormProps {
  closeForm: () => Promise<void>;
}

export const CreateContract: FC<CreateFormProps> = memo(({ closeForm }) => {
  const { address: userAccount } = useAccount();
  const qc = useQueryClient();
  const { getPublicKeyAsync } = useGetPublicKey();

  const durationIntervalQuery = useContractDurationInterval();
  const durationInterval = durationIntervalQuery.data || [0, 0];

  // Input validation setup
  const form = useForm<InputValuesCreateForm>({
    mode: "onBlur",
    defaultValues: {
      walletAddress: userAccount,
      durationHours: 24,
      speedTHPS: 100,
      profitTargetPercent: 5,
    },
  });

  const pubKey = useRef<`0x${string}` | undefined>(undefined);
  const { createNewRentalContractAsync } = useCreateNewRentalContract();

  const inputForm = useCallback(() => {
    return (
      <CreateEditContractForm
        form={form}
        durationIntervalHours={[Math.ceil(durationInterval[0] / 3600), Math.floor(durationInterval[1] / 3600)]}
      />
    );
  }, [form, durationInterval[0], durationInterval[1]]);

  return (
    <TransactionForm
      onClose={closeForm}
      title="Create Hashrate contract"
      description="Sell your hashpower on the Lumerin Marketplace"
      inputForm={inputForm}
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
      resultForm={(props) => <CompletedContent contentState={ContentState.Complete} />}
      transactionSteps={[
        {
          label: "Sign the message so we can retrieve your Public Key",
          action: async () => {
            const pk = await getPublicKeyAsync();
            pubKey.current = pk;
            return { isSkipped: false, txhash: undefined };
          },
        },
        {
          label: "Create Hashrate Contract",
          action: async () => {
            const data = form.getValues();
            const durationSeconds = Number(data.durationHours) * 3600;
            const speedHPS = Number(data.speedTHPS) * 10 ** 12;

            const receipt = await createNewRentalContractAsync({
              profitTargetPercent: Number(data.profitTargetPercent),
              speedHPS: BigInt(speedHPS),
              durationSeconds: BigInt(durationSeconds),
              publicKey: pubKey.current!,
            });
            return {
              isSkipped: false,
              txhash: receipt,
            };
          },
          postConfirmation: async (receipt: TransactionReceipt) => {
            await waitForBlockNumber(receipt.blockNumber, qc);
          },
        },
      ]}
    />
  );
});
