import { type FC, memo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { encryptMessage, formatStratumUrl, truncateAddress } from "../../utils/utils";
import { usePublicClient } from "wagmi";
import { purchasedHashrate } from "../../analytics";
import { decompressPublicKey } from "../../gateway/utils";
import { CONTRACTS_QK, useContractV2, waitForBlockNumber } from "../../hooks/data/useContracts";
import { useValidators } from "../../hooks/data/useValidators";
import type { HashRentalContract, InputValuesBuyForm } from "../../types/types";
import { TransactionForm } from "./Shared/MultistepForm";
import { CreateEditPurchaseForm } from "./Shared/CreateEditPurchaseForm";
import type { TransactionReceipt } from "viem/_types/types/transaction";
import type { GetResponse } from "../../gateway/interfaces";
import { getLastPurchaseDestination, setPoolInfo, storeLastPurchaseDestination } from "../../gateway/localStorage";
import { useQueryClient } from "@tanstack/react-query";
import { GenericConfirmContent } from "./Shared/GenericConfirmContent";
import { GenericCompletedContent } from "./Shared/GenericCompletedContent";
import { isAddressEqual, publicKeyToAddress } from "viem/utils";
import { usePurchaseContract } from "../../hooks/data/usePurchaseContract";
import { useApprovePayment } from "../../hooks/data/useApprovePayment";
import { useApproveFee } from "../../hooks/data/useApproveFee";
import { implementationAbi } from "contracts-js/dist/abi/abi";
import { formatFeePrice, formatHashrateTHPS, formatPaymentPrice } from "../../lib/units";
import { formatDuration } from "../../lib/duration";
import { getPredefinedPoolByAddress, getPredefinedPoolByIndex, predefinedPools } from "./BuyerForms/predefinedPools";

interface BuyFormProps {
  contractId: string;
  setOpen: (isOpen: boolean) => void;
}

export const BuyForm2: FC<BuyFormProps> = memo(
  ({ contractId, setOpen }) => {
    const payment = useApprovePayment();
    const fee = useApproveFee();
    const { purchaseContractAsync } = usePurchaseContract();

    const qc = useQueryClient();
    const pc = usePublicClient();

    const { data: validators } = useValidators({ offset: 0, limit: 100 });
    const contract = useContractV2({ address: contractId as `0x${string}` });

    const lastPurchaseDestination = getLastPurchaseDestination();
    const lastPool = getPredefinedPoolByAddress(lastPurchaseDestination?.poolAddress);
    const lastPoolIsLightning = lastPool?.data.isLightning || false;
    const lastPoolIndex = lastPool ? lastPool.index : -1;

    // form setup
    const form = useForm<InputValuesBuyForm>({
      mode: "onBlur",
      reValidateMode: "onBlur",
      defaultValues: {
        poolAddress: lastPurchaseDestination?.poolAddress || "",
        username: (!lastPoolIsLightning && lastPurchaseDestination?.username) || "",
        validatorAddress: "",
        predefinedPoolIndex: lastPoolIndex,
        lightningAddress: lastPoolIsLightning ? lastPurchaseDestination?.username : "",
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
      [form.control, form.resetField, form.setValue],
    );

    return (
      <TransactionForm
        onClose={() => setOpen(false)}
        client={pc!}
        title="Purchase Hashpower"
        description="Enter the Pool Address, Port Number, and Username you are pointing the purchased
            hashpower to."
        inputForm={inputForm}
        validateInput={async () => {
          return await form.trigger();
        }}
        reviewForm={(props) => {
          const { validatorAddress, poolAddress, username, lightningAddress, predefinedPoolIndex } = form.getValues();
          const isLightning = getPredefinedPoolByIndex(predefinedPoolIndex)?.isLightning;
          return (
            <GenericConfirmContent
              data={{
                Hashrate: formatHashrateTHPS(contract.data!.speed).full,
                Duration: formatDuration(BigInt(contract.data!.length)),
                "Price / Fee": `${formatPaymentPrice(contract.data!.price).full} / ${
                  formatFeePrice(contract.data!.fee).full
                }`,
                "Validator Address": truncateAddress(validatorAddress),
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
        resultForm={(props) => {
          const { predefinedPoolIndex } = form.getValues();
          const isLightning = getPredefinedPoolByIndex(predefinedPoolIndex)?.isLightning;

          return (
            <GenericCompletedContent
              title="Thank you for purchasing Hashpower from Lumerin!"
              description={
                <div className="flex flex-col">
                  Your will be receiving your hashpower shortly.
                  {isLightning && (
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
          );
        }}
        transactionSteps={[
          {
            label: "Approve Payment",
            action: async () => {
              try {
                const receipt = await payment.approveAsync({
                  spender: process.env.REACT_APP_CLONE_FACTORY,
                  amount: BigInt(contract.data!.price),
                });
                return receipt ? { txhash: receipt, isSkipped: false } : { isSkipped: true };
              } catch (error) {
                console.error("Error approving payment:", error);
                throw error;
              }
            },
          },
          {
            label: "Approve Fee",
            action: async () => {
              const receipt = await fee.approveAsync({
                spender: process.env.REACT_APP_CLONE_FACTORY,
                amount: BigInt(contract.data!.fee),
              });
              return receipt ? { txhash: receipt, isSkipped: false } : { isSkipped: true };
            },
          },
          {
            label: "Purchase Contract",
            action: async () => {
              const data = form.getValues();
              const { predefinedPoolIndex } = data;

              const isLightning = getPredefinedPoolByIndex(predefinedPoolIndex)?.isLightning;

              const buyerDest = formatStratumUrl({
                host: data.poolAddress,
                username: isLightning ? data.lightningAddress : data.username,
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

              const pubKey = await pc!.readContract({
                address: contract.data!.id as `0x${string}`,
                abi: implementationAbi,
                functionName: "pubKey",
              });
              const encrValidatorURL = await encryptMessage(pubKey, validatorURL);

              const txhash = await purchaseContractAsync({
                contractAddress: contract.data!.id,
                validatorAddress: validatorAddr,
                encrValidatorURL: encrValidatorURL.toString("hex"),
                encrDestURL: encrDestURL.toString("hex"),
                termsVersion: contract.data!.version,
              });

              purchasedHashrate(Number(contract.data!.speed) * Number(contract.data!.length));
              return { txhash, isSkipped: false };
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
              const isLightning = getPredefinedPoolByIndex(data.predefinedPoolIndex)?.isLightning;
              const username = isLightning ? data.lightningAddress : data.username;

              setPoolInfo({
                contractId,
                poolAddress: data.poolAddress,
                username,
                startedAt: BigInt(startTime),
                validatorAddress: data.validatorAddress,
              });
              storeLastPurchaseDestination(data.poolAddress, username);
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
