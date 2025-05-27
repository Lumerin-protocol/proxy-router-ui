import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { useAccount, usePublicClient } from "wagmi";
import type { EthereumGateway } from "./../../gateway/ethereum";
import { ContentState, type HashRentalContract, type InputValuesBuyForm } from "./../../types/types";
import { encryptMessage, formatStratumUrl, truncateAddress } from "./../../utils/utils";
import { CompletedContent } from "./BuyerForms/CompletedContent";
import { CreateEditPurchaseForm } from "./Shared/CreateEditPurchaseForm";
import { decompressPublicKey } from "../../gateway/utils";
import { useValidators } from "../../hooks/data/useValidators";
import { abi } from "contracts-js";
import { getPoolInfo, setPoolInfo } from "../../gateway/localStorage";
import { predefinedPools } from "./BuyerForms/predefinedPools";
import { useQueryClient } from "@tanstack/react-query";
import { CONTRACTS_QK, waitForBlockNumber } from "../../hooks/data/useContracts";
import type { GetResponse } from "../../gateway/interfaces";
import { TransactionForm } from "./Shared/MultistepForm";
import type { TransactionReceipt } from "viem";
import { GenericConfirmContent } from "./Shared/GenericConfirmContent";
import { GenericCompletedContent } from "./Shared/GenericCompletedContent";
import { memo } from "react";

interface EditFormProps {
  contractId: string;
  web3Gateway?: EthereumGateway;
  closeForm: () => void;
}

export const BuyerEditForm: React.FC<EditFormProps> = memo(
  ({ contractId, web3Gateway, closeForm }) => {
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
          <CreateEditPurchaseForm control={form.control} resetField={form.resetField} setValue={form.setValue} />
        )}
        validateInput={async () => {
          return await form.trigger();
        }}
        reviewForm={(props) => {
          const { validatorAddress, poolAddress, username, lightningAddress } = form.getValues();
          return (
            <GenericConfirmContent
              data={{
                "Validator Address": truncateAddress(validatorAddress),
                "Pool Address": poolAddress,
                ...(username && { Username: username }),
                ...(lightningAddress && {
                  "Lightning Address": lightningAddress,
                }),
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
  },
  (prevProps, nextProps) => {
    return prevProps.contractId === nextProps.contractId;
  },
);
