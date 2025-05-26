import { memo } from "react";
import { useForm } from "react-hook-form";
import { encryptMessage, formatStratumUrl } from "../../utils/utils";
import { useAccount, usePublicClient } from "wagmi";
import { purchasedHashrate } from "../../analytics";
import type { EthereumGateway } from "../../gateway/ethereum";
import { decompressPublicKey } from "../../gateway/utils";
import { CONTRACTS_QK, useContract, waitForBlockNumber } from "../../hooks/data/useContracts";
import { useValidators } from "../../hooks/data/useValidators";
import { ContentState, type HashRentalContract, type InputValuesBuyForm } from "../../types/types";
import { TransactionForm } from "./MultistepForm";
import { ReviewContent } from "./BuyerForms/ReviewContent";
import { ConfirmContent } from "./BuyerForms/ConfirmContent";
import { CompletedContent } from "./SellerForms/CompletedContent";
import type { TransactionReceipt } from "viem/_types/types/transaction";
import type { GetResponse } from "../../gateway/interfaces";
import { setPoolInfo } from "../../gateway/localStorage";
import { useQueryClient } from "@tanstack/react-query";

interface BuyFormProps {
  contractId: string;
  web3Gateway?: EthereumGateway;
  setOpen: (isOpen: boolean) => void;
}

export const BuyForm2 = memo(({ contractId, web3Gateway, setOpen }: BuyFormProps) => {
  const { address: userAccount } = useAccount();
  const publicClient = usePublicClient();
  const { data: validators } = useValidators({ offset: 0, limit: 100 });
  const contract = useContract({ address: contractId as `0x${string}`, refetch: false });
  const qc = useQueryClient();

  // form setup
  const form = useForm<InputValuesBuyForm>({
    mode: "onBlur",
    reValidateMode: "onBlur",
    defaultValues: {
      poolAddress: "",
      username: "",
      validatorAddress: "",
      predefinedPoolIndex: "",
      lightningAddress: "",
    },
  });

  const validator = validators?.find((v) => v.addr === form.getValues().validatorAddress)?.host;

  return (
    <TransactionForm
      onCancel={() => setOpen(false)}
      client={publicClient!}
      title="Purchase Hashpower"
      description="Enter the Pool Address, Port Number, and Username you are pointing the purchased
            hashpower to."
      inputForm={(props) => (
        <ReviewContent control={form.control} resetField={form.resetField} setValue={form.setValue} />
      )}
      validateInput={async () => {
        return await form.trigger();
      }}
      reviewForm={(props) => <ConfirmContent data={form.getValues()} validator={validator} />}
      resultForm={(props) => <CompletedContent contentState={ContentState.Complete} />}
      transactionSteps={[
        {
          label: "Approve Payment",
          action: async () => {
            try {
              const receipt = await web3Gateway!.approvePayment(contract.data!.price, userAccount!);
              return receipt.transactionHash!;
            } catch (error) {
              console.error("herer", error);
              throw error;
            }
          },
        },
        {
          label: "Approve Fee",
          action: async () => {
            const receipt = await web3Gateway!.approveFee(contract.data!.fee, userAccount!);
            return receipt.transactionHash!;
          },
        },
        {
          label: "Purchase Contract",
          action: async () => {
            const data = form.getValues();

            const buyerDest = formatStratumUrl({
              host: data.poolAddress,
              username: data.username,
            });

            const validator = validators?.find((v) => v.addr === data.validatorAddress)!;
            if (!validator) {
              throw new Error("Validator is not set");
            }

            const validatorPublicKey = decompressPublicKey(validator.pubKeyYparity, validator.pubKeyX);

            const encrDestURL = await encryptMessage(validatorPublicKey.slice(2), buyerDest);

            const validatorURL = formatStratumUrl({
              host: validator.host,
              username: data.username,
            });

            const pubKey = await web3Gateway!.getContractPublicKey(contract.data!.id);
            const encrValidatorURL = await encryptMessage(pubKey, validatorURL);

            const receipt2 = await web3Gateway!.purchaseContract({
              contractAddress: contract.data!.id,
              validatorAddress: validator.addr,
              encrValidatorURL: encrValidatorURL.toString("hex"),
              encrDestURL: encrDestURL.toString("hex"),
              buyer: userAccount!,
              termsVersion: contract.data!.version,
            });

            purchasedHashrate(Number(contract.data!.speed) * Number(contract.data!.length));
            return receipt2.txHash!;
          },
          postConfirmation: async (receipt: TransactionReceipt) => {
            await waitForBlockNumber(receipt.blockNumber, qc);
            const startTime = qc
              .getQueryData<GetResponse<HashRentalContract[]>>([CONTRACTS_QK])
              ?.data.find((c) => c.id === contractId)?.timestamp;

            if (!startTime) {
              throw new Error("Start time not found");
            }

            const data = form.getValues();

            setPoolInfo({
              contractId,
              poolAddress: data.poolAddress,
              username: data.username || data.lightningAddress,
              startedAt: BigInt(startTime),
              validatorAddress: data.validatorAddress,
            });
          },
        },
      ]}
    />
  );
});

// BuyForm2.whyDidYouRender = true;
