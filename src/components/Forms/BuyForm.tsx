import { memo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { encryptMessage, formatStratumUrl, truncateAddress } from "../../utils/utils";
import { useAccount, usePublicClient } from "wagmi";
import { purchasedHashrate } from "../../analytics";
import type { EthereumGateway } from "../../gateway/ethereum";
import { decompressPublicKey } from "../../gateway/utils";
import { CONTRACTS_QK, useContractV2, waitForBlockNumber } from "../../hooks/data/useContracts";
import { useValidators } from "../../hooks/data/useValidators";
import type { HashRentalContract, InputValuesBuyForm } from "../../types/types";
import { TransactionForm } from "./Shared/MultistepForm";
import { CreateEditPurchaseForm } from "./Shared/CreateEditPurchaseForm";
import type { TransactionReceipt } from "viem/_types/types/transaction";
import type { GetResponse } from "../../gateway/interfaces";
import { setPoolInfo } from "../../gateway/localStorage";
import { useQueryClient } from "@tanstack/react-query";
import { GenericConfirmContent } from "./Shared/GenericConfirmContent";
import { GenericCompletedContent } from "./Shared/GenericCompletedContent";
import { publicKeyToAddress } from "viem/utils";

interface BuyFormProps {
  contractId: string;
  web3Gateway?: EthereumGateway;
  setOpen: (isOpen: boolean) => void;
}

export const BuyForm2 = memo(
  ({ contractId, web3Gateway, setOpen }: BuyFormProps) => {
    const { address: userAccount } = useAccount();
    const publicClient = usePublicClient();

    const { data: validators } = useValidators({ offset: 0, limit: 100 });
    const contract = useContractV2({ address: contractId as `0x${string}` });

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
        customValidatorHost: "",
        customValidatorPublicKey: "",
      },
    });

    const inputForm = useCallback(
      () => (
        <CreateEditPurchaseForm
          control={form.control}
          resetField={form.resetField}
          setValue={form.setValue}
          key="form"
        />
      ),
      [],
    );

    return (
      <TransactionForm
        onCancel={() => setOpen(false)}
        client={publicClient!}
        title="Purchase Hashpower"
        description="Enter the Pool Address, Port Number, and Username you are pointing the purchased
            hashpower to."
        inputForm={inputForm}
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
            title="Thank you for purchasing Hashpower from Lumerin!"
            description={
              <div className="flex flex-col">
                Your will be receiving your hashpower shortly.
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
            label: "Approve Payment",
            action: async () => {
              try {
                const receipt = await web3Gateway!.approvePayment(contract.data!.price, userAccount!);
                return receipt.transactionHash
                  ? { txhash: receipt.transactionHash, isSkipped: false }
                  : { isSkipped: true };
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
              return receipt.transactionHash
                ? { txhash: receipt.transactionHash, isSkipped: false }
                : { isSkipped: true };
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

              // const validator = validators?.find((v) => v.addr === data.validatorAddress)!;
              // if (!validator) {
              //   throw new Error("Validator is not set");
              // }

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

              const pubKey = await web3Gateway!.getContractPublicKey(contract.data!.id);
              const encrValidatorURL = await encryptMessage(pubKey, validatorURL);

              const receipt2 = await web3Gateway!.purchaseContract({
                contractAddress: contract.data!.id,
                validatorAddress: validatorAddr,
                encrValidatorURL: encrValidatorURL.toString("hex"),
                encrDestURL: encrDestURL.toString("hex"),
                buyer: userAccount!,
                termsVersion: contract.data!.version,
              });

              purchasedHashrate(Number(contract.data!.speed) * Number(contract.data!.length));
              return receipt2.txHash ? { txhash: receipt2.txHash, isSkipped: false } : { isSkipped: true };
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

// BuyForm2.whyDidYouRender = true;
