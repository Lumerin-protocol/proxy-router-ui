import { type FC, useCallback, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useAccount } from "wagmi";
import { useRemoveMargin } from "../../hooks/data/useRemoveMargin";
import { useGetFutureBalance } from "../../hooks/data/useGetFutureBalance";
import { TransactionFormV2 as TransactionForm } from "./Shared/MultistepForm";
import { AmountInputForm } from "./Shared/AmountInputForm";
import { formatValue, paymentToken } from "../../lib/units";
import { parseUnits } from "viem";

interface WithdrawalFormProps {
  closeForm: () => void;
  minMargin: bigint | null;
  isLoadingMinMargin: boolean;
}

interface InputValues {
  amount: string;
}

export const WithdrawalForm: FC<WithdrawalFormProps> = ({ closeForm, minMargin, isLoadingMinMargin }) => {
  const { address } = useAccount();
  const { removeMarginAsync, isPending } = useRemoveMargin();
  const futureBalance = useGetFutureBalance(address);

  // Calculate available balance: balance - minMargin (minMargin is locked amount)
  // getMinMargin returns int256, where positive values represent locked amount
  const lockedAmount = useMemo(() => {
    // If minMargin is positive, it's the locked amount. If negative or zero, no locked amount.
    return minMargin && minMargin > 0n ? minMargin : 0n;
  }, [minMargin]);

  const availableBalance = useMemo(() => {
    if (!futureBalance.data) return undefined;
    const balance = futureBalance.data;

    // Available balance is balance minus locked amount
    const available = balance > lockedAmount ? balance - lockedAmount : 0n;
    return available;
  }, [futureBalance.data, lockedAmount]);

  const form = useForm<InputValues>({
    mode: "onBlur",
    reValidateMode: "onBlur",
    defaultValues: {
      amount: "",
    },
  });

  const validateBalance = useCallback(
    (value: string): string | true => {
      if (!futureBalance.data || availableBalance === undefined) {
        return "Unable to fetch balance. Please try again.";
      }
      const amountBigInt = parseUnits(value, paymentToken.decimals);
      if (amountBigInt > availableBalance) {
        const balanceFormatted = formatValue(availableBalance, paymentToken).valueRounded;
        return `Insufficient balance. Available: ${Number(balanceFormatted).toFixed(2)} ${paymentToken.symbol}`;
      }
      return true;
    },
    [futureBalance.data, availableBalance],
  );

  const handleMaxClick = useCallback(() => {
    if (availableBalance !== undefined) {
      const numValue = Number(availableBalance) / 1e6; // Convert from wei to USDC
      const floored = Math.floor(numValue * 100) / 100; // Round down to 2 decimals
      const maxAmount = floored.toFixed(2);
      form.setValue("amount", maxAmount);
    }
  }, [availableBalance, form]);

  const inputForm = useCallback(
    () => (
      <div className="space-y-4">
        <AmountInputForm
          control={form.control}
          label="Withdrawal Amount"
          additionalValidate={validateBalance}
          onMaxClick={handleMaxClick}
          showMaxButton={availableBalance !== undefined}
        />
        <div className="p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-300">Total balance:</span>
            <span className="text-white font-medium">
              {Number(futureBalance.data ? formatValue(futureBalance.data, paymentToken).value : "0").toFixed(2)}{" "}
              {paymentToken.symbol}
            </span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-300">Locked amount:</span>
            <span className="text-white font-medium">
              {Number(formatValue(lockedAmount, paymentToken).value).toFixed(2)} {paymentToken.symbol}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Available balance:</span>
            <span className="text-white font-medium">
              {availableBalance !== undefined
                ? (() => {
                    const numValue = Number(availableBalance) / 1e6; // Convert from wei to USDC
                    const floored = Math.floor(numValue * 100) / 100; // Round down to 2 decimals
                    return floored.toFixed(2);
                  })()
                : "0"}{" "}
              {paymentToken.symbol}
            </span>
          </div>
        </div>
      </div>
    ),
    [form.control, validateBalance, handleMaxClick, availableBalance, futureBalance.data, lockedAmount],
  );

  const validateInput = useCallback(async () => {
    const amountValue = form.getValues("amount");
    if (!amountValue || parseFloat(amountValue) <= 0) {
      form.setError("amount", {
        type: "validation",
        message: "Withdrawal Amount must be a positive number",
      });
      return false;
    }

    // Check if balance is available
    if (!futureBalance.data || availableBalance === undefined) {
      form.setError("amount", {
        type: "validation",
        message: "Unable to fetch balance. Please try again.",
      });
      return false;
    }

    // Validate that amount doesn't exceed available balance (balance - shortfall)
    const amountBigInt = parseUnits(amountValue, paymentToken.decimals);
    if (amountBigInt > availableBalance) {
      const balanceFormatted = formatValue(availableBalance, paymentToken).valueRounded;
      form.setError("amount", {
        type: "validation",
        message: `Insufficient balance. Available: ${balanceFormatted} ${paymentToken.symbol}`,
      });
      return false;
    }

    return true;
  }, [form, futureBalance.data, availableBalance]);

  const transactionSteps = [
    {
      label: "Withdraw Margin",
      async action() {
        const amount = form.getValues("amount");
        if (!amount) throw new Error("Amount not set");
        const amountBigInt = parseUnits(amount, paymentToken.decimals);
        const result = await removeMarginAsync({ amount: amountBigInt });
        return result ? { isSkipped: false, txhash: result } : { isSkipped: false };
      },
    },
  ];

  return (
    <TransactionForm
      onClose={closeForm}
      title="Withdraw Margin"
      description="Remove margin from your futures account"
      reviewForm={inputForm}
      validateInput={validateInput}
      transactionSteps={transactionSteps}
      resultForm={(p) => (
        <div className="space-y-4">
          <div className="p-4 rounded-lg">
            <p className="text-gray-300">Your withdrawal has been processed successfully.</p>
            <p className="text-white font-medium mt-2">
              Amount withdrawn: {form.getValues("amount")} {paymentToken.symbol}
            </p>
          </div>
        </div>
      )}
    />
  );
};
