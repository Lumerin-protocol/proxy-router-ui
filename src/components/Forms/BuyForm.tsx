import { type FC, memo, useCallback, useEffect } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { encryptMessage } from "../../utils/encrypt";
import { formatStratumUrl } from "../../utils/formatters";
import { truncateAddress } from "../../utils/formatters";
import { useAccount, usePublicClient } from "wagmi";
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
import { useQueryClient, UseQueryResult } from "@tanstack/react-query";
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
import { useFeeTokenBalance } from "../../hooks/data/useFeeTokenBalance";
import { usePaymentTokenBalance } from "../../hooks/data/usePaymentTokenBalance";

interface BuyFormProps {
  contractId: string;
  closeForm: () => void;
}

export const BuyForm: FC<BuyFormProps> = memo(
  ({ contractId, closeForm }) => {
    const payment = useApprovePayment();
    const fee = useApproveFee();
    const { purchaseContractAsync } = usePurchaseContract();

    const qc = useQueryClient();
    const pc = usePublicClient();

    const { data: validators } = useValidators({ offset: 0, limit: 100 });
    const contract = useContractV2({ address: contractId as `0x${string}` });
    const slippagePercent = process.env.REACT_APP_PAYMENT_SLIPPAGE_PERCENT;
    const priceWSlippage = adjustForSlippage(contract.data?.price, slippagePercent);
    const feeWSlippage = adjustForSlippage(contract.data?.fee, slippagePercent);

    // form setup
    const form = useForm<InputValuesBuyForm>({
      mode: "onBlur",
      reValidateMode: "onBlur",
      defaultValues: getDefaultInputValues(),
    });

    const { address } = useAccount();
    const feeTokenBalance = useFeeTokenBalance(address);
    const paymentTokenBalance = usePaymentTokenBalance(address);

    useEffect(() => {
      validateBalance(feeTokenBalance, paymentTokenBalance, feeWSlippage, priceWSlippage, form);
    }, [feeTokenBalance.data, paymentTokenBalance.data, feeWSlippage, priceWSlippage, form]);

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
        onClose={closeForm}
        title="Purchase Hashpower"
        description="Enter the Pool Address, Port Number, and Username you are pointing the purchased
            hashpower to."
        inputForm={inputForm}
        validateInput={async () => {
          const isValid = await form.trigger();
          if (!isValid) {
            return false;
          }
          return validateBalance(feeTokenBalance, paymentTokenBalance, feeWSlippage, priceWSlippage, form);
        }}
        reviewForm={(props) => {
          const {
            validatorAddress,
            poolAddress,
            username,
            lightningAddress,
            predefinedPoolIndex,
            customValidatorHost,
            customValidatorPublicKey,
          } = form.getValues();
          const isLightning = getPredefinedPoolByIndex(predefinedPoolIndex)?.isLightning;
          const isCustomValidator = validatorAddress === "custom";
          return (
            <GenericConfirmContent
              data={{
                Hashrate: formatHashrateTHPS(contract.data!.speed).full,
                Duration: formatDuration(BigInt(contract.data!.length)),
                "Price / Fee": `${formatPaymentPrice(contract.data!.price).full} / ${
                  formatFeePrice(contract.data!.fee).full
                } ± ${slippagePercent}% slippage`,
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
        resultForm={(props) => {
          const { predefinedPoolIndex } = form.getValues();
          const isLightning = getPredefinedPoolByIndex(predefinedPoolIndex)?.isLightning;

          return (
            <GenericCompletedContent
              title="Thank you for purchasing Hashpower from Lumerin!"
              description={
                <div className="flex flex-col">
                  You will be receiving hashpower shortly.
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
                  amount: priceWSlippage,
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
                amount: feeWSlippage,
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

function validateBalance(
  feeTokenBalance: UseQueryResult<bigint, Error>,
  paymentTokenBalance: UseQueryResult<bigint, Error>,
  feeWSlippage: bigint,
  priceWSlippage: bigint,
  form: UseFormReturn<InputValuesBuyForm>,
) {
  let isValid = true;
  if (feeTokenBalance.isSuccess && paymentTokenBalance.isSuccess) {
    if (feeTokenBalance.data < BigInt(feeWSlippage)) {
      form.setError("root.feeTokenBalance", { message: "Insufficient LMR balance" });
      isValid = false;
    }
    if (paymentTokenBalance.data < BigInt(priceWSlippage)) {
      form.setError("root.paymentTokenBalance", { message: "Insufficient USDC balance" });
      isValid = false;
    }
  }
  return isValid;
}

function getDefaultInputValues(): InputValuesBuyForm {
  const lastPurchaseDestination = getLastPurchaseDestination();
  if (!lastPurchaseDestination) {
    return {
      poolAddress: "",
      username: "",
      validatorAddress: "",
      predefinedPoolIndex: "" as const,
      lightningAddress: "",
      customValidatorHost: "",
      customValidatorPublicKey: "",
    };
  }
  const lastPool = getPredefinedPoolByAddress(lastPurchaseDestination?.poolAddress);
  const lastPoolIsLightning = lastPool?.data.isLightning || false;
  const lastPoolIndex = lastPool ? lastPool.index : -1;
  return {
    poolAddress: lastPurchaseDestination?.poolAddress || "",
    username: (!lastPoolIsLightning && lastPurchaseDestination?.username) || "",
    validatorAddress: "",
    predefinedPoolIndex: lastPoolIndex,
    lightningAddress: lastPoolIsLightning ? lastPurchaseDestination?.username : "",
    customValidatorHost: "",
    customValidatorPublicKey: "",
  };
}

function adjustForSlippage(amountInput: bigint | string | undefined, slippagePercent: number) {
  if (!amountInput) {
    return 0n;
  }
  const amount = BigInt(amountInput);
  return (amount * BigInt(100 + slippagePercent)) / BigInt(100);
}
