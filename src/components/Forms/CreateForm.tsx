import { useForm } from "react-hook-form";
import { useAccount, usePublicClient } from "wagmi";
import type { EthereumGateway } from "../../gateway/ethereum";
import { CompletedContent } from "./SellerForms/CompletedContent";
import { ConfirmContent } from "./SellerForms/ConfirmContent";
import { ReviewContent } from "./SellerForms/ReviewContent";
import { waitForBlockNumber } from "../../hooks/data/useContracts";
import { useQueryClient } from "@tanstack/react-query";
import { TransactionForm } from "./MultistepForm";
import type { TransactionReceipt } from "viem";
import { ContentState } from "../../types/types";
import { useRef } from "react";

export interface InputValuesCreateForm {
  walletAddress: string;
  durationHours: number | "";
  speedTHPS: number | "";
  profitTargetPercent: number | "";
}

interface CreateFormProps {
  web3Gateway: EthereumGateway;
  setOpen: (isOpen: boolean) => void;
}

export const CreateContract: React.FC<CreateFormProps> = ({ web3Gateway, setOpen }) => {
  const { address: userAccount } = useAccount();
  const qc = useQueryClient();
  const publicClient = usePublicClient();

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

  return (
    <TransactionForm
      onCancel={() => setOpen(false)}
      client={publicClient!}
      title="Create Hashrate contract"
      description="Sell your hashpower on the Lumerin Marketplace"
      inputForm={(props) => <ReviewContent form={form} isCreate />}
      validateInput={async () => {
        return await form.trigger();
      }}
      reviewForm={(props) => <ConfirmContent data={form.getValues()} />}
      resultForm={(props) => <CompletedContent contentState={ContentState.Complete} />}
      transactionSteps={[
        {
          label: "Sign the message so we can retrieve your Public Key",
          action: async () => {
            const pk = await web3Gateway.getPublicKey(userAccount!);
            pubKey.current = pk;
            return undefined;
          },
        },
        {
          label: "Create Hashrate Contract",
          action: async () => {
            const data = form.getValues();
            const durationSeconds = Number(data.durationHours) * 3600;
            const speedHPS = Number(data.speedTHPS) * 10 ** 12;

            const receipt = await web3Gateway.createContract({
              profitTargetPercent: BigInt(data.profitTargetPercent),
              speedHPS: BigInt(speedHPS),
              durationSeconds: BigInt(durationSeconds),
              publicKey: pubKey.current!,
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
