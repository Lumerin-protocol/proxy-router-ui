import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { useAccount, usePublicClient } from "wagmi";
import type { EthereumGateway } from "./../../gateway/ethereum";
import { ContentState, type HashRentalContract, type InputValuesBuyForm } from "./../../types/types";
import { encryptMessage, formatStratumUrl } from "./../../utils/utils";
import { CompletedContent } from "./BuyerForms/CompletedContent";
import { ConfirmContent } from "./BuyerForms/ConfirmContent";
import { ReviewContent } from "./BuyerForms/ReviewContent";
import { decompressPublicKey } from "../../gateway/utils";
import { useValidators } from "../../hooks/data/useValidators";
import { abi } from "contracts-js";
import { getPoolInfo, setPoolInfo } from "../../gateway/localStorage";
import { predefinedPools } from "./BuyerForms/predefinedPools";
import { useQueryClient } from "@tanstack/react-query";
import { CONTRACTS_QK, waitForBlockNumber } from "../../hooks/data/useContracts";
import type { GetResponse } from "../../gateway/interfaces";
import { TransactionForm } from "./MultistepForm";
import type { TransactionReceipt } from "viem";

interface EditFormProps {
  contractId: string;
  web3Gateway?: EthereumGateway;
  closeForm: () => void;
}

export const BuyerEditForm: React.FC<EditFormProps> = ({ contractId, web3Gateway, closeForm }) => {
  const { address: userAccount } = useAccount();
  const { data: validators } = useValidators({ offset: 0, limit: 100 });
  const client = usePublicClient();
  const qc = useQueryClient();

  // Input validation setup
  const form = useForm<InputValuesBuyForm>({
    mode: "onBlur",
    reValidateMode: "onBlur",
    defaultValues: async () => {
      const startTime = await client!.readContract({
        address: contractId as `0x${string}`,
        abi: abi.implementationAbi,
        functionName: "startingBlockTimestamp",
      });

      const poolInfo = getPoolInfo({ contractId, startedAt: startTime });
      const poolIndex = predefinedPools.findIndex((p) => p.address === poolInfo?.poolAddress);
      const isLightning = poolIndex !== -1 && predefinedPools[poolIndex].isLightning;
      const validatorAddress = validators?.find((v) => v.addr === poolInfo?.validatorAddress)?.addr;

      const defaultValues = {
        poolAddress: poolInfo?.poolAddress || "",
        username: poolInfo && !isLightning ? poolInfo.username : "",
        predefinedPoolIndex: poolIndex,
        lightningAddress: poolInfo && isLightning ? poolInfo.username : "",
        validatorAddress: validatorAddress || "",
      };

      return defaultValues;
    },
  });

  const validator = validators?.find((v) => v.addr === form.getValues().validatorAddress)!;

  return (
    <TransactionForm
      onCancel={closeForm}
      client={client!}
      title="Edit purchase"
      description="Here you can edit the pool address and username you are pointing the purchased hashpower to."
      inputForm={(props) => (
        <ReviewContent control={form.control} resetField={form.resetField} setValue={form.setValue} />
      )}
      validateInput={async () => {
        return await form.trigger();
      }}
      reviewForm={(props) => <ConfirmContent data={form.getValues()} validator={validator.host} />}
      resultForm={(props) => (
        <CompletedContent
          contentState={ContentState.Complete}
          isEdit
          useLightningPayouts={form.getValues().lightningAddress !== ""}
        />
      )}
      transactionSteps={[
        {
          label: "Edit Contract",
          action: async () => {
            const data = form.getValues();
            const buyerDest = formatStratumUrl({
              host: data.poolAddress,
              username: data.username,
            });

            const validatorPublicKey = decompressPublicKey(validator.pubKeyYparity, validator.pubKeyX);

            const encrDestURL = await encryptMessage(validatorPublicKey.slice(2), buyerDest);

            const validatorURL = formatStratumUrl({
              host: validator.host,
              username: data.username,
            });
            const pubKey = await web3Gateway!.getContractPublicKey(contractId);
            const encrValidatorURL = await encryptMessage(pubKey, validatorURL);

            const receipt = await web3Gateway!.editContractDestination({
              from: userAccount!,
              contractAddress: contractId,
              encrValidatorURL: encrValidatorURL.toString("hex"),
              encrDestURL: encrDestURL.toString("hex"),
            });

            return receipt.txHash as `0x${string}`;
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
};

// BuyerEditForm.whyDidYouRender = true;
