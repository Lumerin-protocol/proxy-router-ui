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
import { type FC, memo, useRef } from "react";
import { truncateAddress } from "../../utils/utils";
import { useGetPublicKey } from "../../hooks/data/usePublicKey";
import { useCreateNewRentalContract } from "../../hooks/data/useCreateNewRentalContract";

export interface InputValuesCreateForm {
  walletAddress: string;
  durationHours: number | "";
  speedTHPS: number | "";
  profitTargetPercent: number | "";
}

interface CreateFormProps {
  setOpen: (isOpen: boolean) => void;
}

export const CreateContract: FC<CreateFormProps> = memo(
  ({ setOpen }) => {
    const { address: userAccount } = useAccount();
    const qc = useQueryClient();
    const { getPublicKeyAsync } = useGetPublicKey();

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

    return (
      <TransactionForm
        onClose={() => setOpen(false)}
        title="Create Hashrate contract"
        description="Sell your hashpower on the Lumerin Marketplace"
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
  },
  () => {
    return false;
  },
);
