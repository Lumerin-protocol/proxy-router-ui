import { useForm } from "react-hook-form";
import { usePublicClient } from "wagmi";
import type { HashRentalContract, InputValuesBuyForm } from "./../../types/types";
import { encryptMessage } from "../../utils/encrypt";
import { formatStratumUrl } from "../../utils/formatters";
import { truncateAddress } from "../../utils/formatters";
import { CreateEditPurchaseForm } from "./Shared/CreateEditPurchaseForm";
import { decompressPublicKey } from "../../gateway/utils";
import { useValidators } from "../../hooks/data/useValidators";
import { implementationAbi } from "contracts-js/dist/abi/abi";
import { getPoolInfo, setPoolInfo, storeLastPurchaseDestination } from "../../gateway/localStorage";
import { getPredefinedPoolByIndex, predefinedPools } from "./BuyerForms/predefinedPools";
import { useQueryClient } from "@tanstack/react-query";
import { CONTRACTS_QK, waitForBlockNumber } from "../../hooks/data/useContracts";
import type { GetResponse } from "../../gateway/interfaces";
import { TransactionForm } from "./Shared/MultistepForm";
import { isAddressEqual, type TransactionReceipt } from "viem";
import { GenericConfirmContent } from "./Shared/GenericConfirmContent";
import { GenericCompletedContent } from "./Shared/GenericCompletedContent";
import { memo } from "react";
import { useEditContractDestination } from "../../hooks/data/useEditContractDestination";
import { publicKeyToAddress } from "viem/accounts";

interface EditFormProps {
  contractId: string;
  closeForm: () => void;
}

export const BuyerEditForm: React.FC<EditFormProps> = memo(
  ({ contractId, closeForm }) => {
    const pc = usePublicClient();
    const qc = useQueryClient();
    const { data: validators } = useValidators({ offset: 0, limit: 100 });
    const { editContractDestinationAsync } = useEditContractDestination();

    // Input validation setup
    const form = useForm<InputValuesBuyForm>({
      mode: "onBlur",
      reValidateMode: "onBlur",
      defaultValues: async () => {
        const startTime = await pc!.readContract({
          address: contractId as `0x${string}`,
          abi: implementationAbi,
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
          customValidatorPublicKey: "",
          customValidatorHost: "",
        };

        return defaultValues;
      },
    });

    const validator = validators?.find((v) => v.addr === form.getValues().validatorAddress)!;

    return (
      <TransactionForm
        onClose={closeForm}
        title="Edit purchase"
        description="Here you can edit the pool address and username you are pointing the purchased hashpower to."
        inputForm={(props) => (
          <CreateEditPurchaseForm control={form.control} resetField={form.resetField} setValue={form.setValue} />
        )}
        validateInput={async () => {
          return await form.trigger();
        }}
        reviewForm={(props) => {
          const {
            validatorAddress,
            poolAddress,
            username,
            lightningAddress,
            customValidatorHost,
            customValidatorPublicKey,
            predefinedPoolIndex,
          } = form.getValues();
          const isLightning = getPredefinedPoolByIndex(predefinedPoolIndex)?.isLightning;
          const isCustomValidator = validatorAddress === "custom";
          return (
            <GenericConfirmContent
              data={{
                ...(isCustomValidator
                  ? {
                      "Custom Validator Host": customValidatorHost,
                      "Custom Validator Public Key": truncateAddress(customValidatorPublicKey),
                    }
                  : {
                      "Validator Address": truncateAddress(validatorAddress),
                    }),
                "Pool Address": poolAddress,
                ...(isLightning
                  ? {
                      "Lightning Address": lightningAddress,
                    }
                  : { Username: username }),
              }}
            />
          );
        }}
        resultForm={(props) => (
          <GenericCompletedContent
            title="Your order has been updated"
            description={
              <div className="flex flex-col">
                Your changes will be effective shortly
                {form.getValues().lightningAddress !== "" && (
                  <a
                    href={process.env.REACT_APP_TITAN_LIGHTNING_DASHBOARD || "https://lightning.titan.io"}
                    target="_blank"
                    rel="noreferrer"
                    style={{ cursor: "pointer" }}
                    className="font-light underline mb-4"
                  >
                    Dashboard for Lightning users
                  </a>
                )}
              </div>
            }
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

              let validatorPublicKey: `0x${string}`;
              let validatorAddr: `0x${string}`;
              let validatorHost: string;

              if (data.validatorAddress === "custom") {
                validatorPublicKey = data.customValidatorPublicKey as `0x${string}`;
                validatorAddr = publicKeyToAddress(validatorPublicKey);
                validatorHost = data.customValidatorHost;
              } else {
                const validator = validators?.find((v) => v.addr === data.validatorAddress)!;
                validatorPublicKey = decompressPublicKey(validator.pubKeyYparity, validator.pubKeyX);
                validatorAddr = publicKeyToAddress(validatorPublicKey);
                validatorHost = validator.host;
              }

              const encrDestURL = await encryptMessage(validatorPublicKey.slice(2), buyerDest);

              const validatorURL = formatStratumUrl({
                host: validatorHost,
                username: data.username,
              });

              const sellerPublicKey = await pc!.readContract({
                address: contractId as `0x${string}`,
                abi: implementationAbi,
                functionName: "pubKey",
              });

              const encrValidatorURL = await encryptMessage(sellerPublicKey, validatorURL);

              const txhash = await editContractDestinationAsync({
                contractAddress: contractId,
                encrValidatorURL: encrValidatorURL.toString("hex"),
                encrDestURL: encrDestURL.toString("hex"),
              });

              return {
                isSkipped: false,
                txhash: txhash,
              };
            },
            postConfirmation: async (receipt: TransactionReceipt) => {
              await waitForBlockNumber(receipt.blockNumber, qc);

              const startTime = qc
                .getQueryData<GetResponse<HashRentalContract[]>>([CONTRACTS_QK])
                ?.data.find((c) => isAddressEqual(c.id as `0x${string}`, contractId as `0x${string}`))?.timestamp;

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
              storeLastPurchaseDestination(data.poolAddress, data.username);
            },
          },
        ]}
      />
    );
  },
  (prevProps, nextProps) => {
    return prevProps.contractId === nextProps.contractId;
  },
);
