import { type FC, useCallback, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useAccount } from "wagmi";
import { useRemoveMargin } from "../../hooks/data/useRemoveMargin";
import { useGetFutureBalance } from "../../hooks/data/useGetFutureBalance";
import { useGetMarginShortfall } from "../../hooks/data/useGetMarginShortfall";
import { TransactionFormV2 as TransactionForm } from "./Shared/MultistepForm";
import { AmountInputForm } from "./Shared/AmountInputForm";
import { formatValue, paymentToken } from "../../lib/units";
import { parseUnits } from "viem";

interface WithdrawalFormProps {
  closeForm: () => void;
}

interface InputValues {
  amount: string;
}

export const WithdrawalForm: FC<WithdrawalFormProps> = ({ closeForm }) => {
  const { address } = useAccount();
  const { removeMarginAsync, isPending } = useRemoveMargin();
  const futureBalance = useGetFutureBalance(address);
  const marginShortfall = useGetMarginShortfall(address);

  // Calculate available balance: balance - shortfall (shortfall is locked amount)
  // getMarginShortfall returns int256, where positive values represent locked amount
  const lockedAmount = useMemo(() => {
    const shortfall = marginShortfall.data;
    // If shortfall is positive, it's the locked amount. If negative or zero, no shortfall.
    return shortfall && shortfall > 0n ? shortfall : 0n;
  }, [marginShortfall.data]);

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

  const [amount, setAmount] = useState<string>("");

  const validateBalance = useCallback(
    (value: string): string | true => {
      if (!futureBalance.data || availableBalance === undefined) {
        return "Unable to fetch balance. Please try again.";
      }
      const amountBigInt = parseUnits(value, paymentToken.decimals);
      if (amountBigInt > availableBalance) {
        const balanceFormatted = formatValue(availableBalance, paymentToken).valueRounded;
        return `Insufficient balance. Available: ${balanceFormatted} ${paymentToken.symbol}`;
      }
      return true;
    },
    [futureBalance.data, availableBalance],
  );

  const inputForm = useCallback(
    () => (
      <div className="space-y-4">
        <AmountInputForm control={form.control} label="Withdrawal Amount" additionalValidate={validateBalance} />
        <div className="p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-300">Total balance:</span>
            <span className="text-white font-medium">
              {futureBalance.data ? formatValue(futureBalance.data, paymentToken).valueRounded : "0"}{" "}
              {paymentToken.symbol}
            </span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-300">Locked amount:</span>
            <span className="text-white font-medium">
              {formatValue(lockedAmount, paymentToken).valueRounded} {paymentToken.symbol}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Available balance:</span>
            <span className="text-white font-medium">
              {availableBalance !== undefined ? formatValue(availableBalance, paymentToken).valueRounded : "0"}{" "}
              {paymentToken.symbol}
            </span>
          </div>
        </div>
      </div>
    ),
    [form.control, validateBalance, futureBalance.data, lockedAmount, availableBalance],
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

    setAmount(amountValue);
    return true;
  }, [form, futureBalance.data, availableBalance]);

  const reviewForm = useCallback(
    () => (
      <div className="space-y-4">
        <div className="p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-300">Amount to withdraw:</span>
            <span className="text-white font-medium">
              {amount} {paymentToken.symbol}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Available balance:</span>
            <span className="text-white font-medium">
              {availableBalance !== undefined ? formatValue(availableBalance, paymentToken).valueRounded : "0"}{" "}
              {paymentToken.symbol}
            </span>
          </div>
        </div>
      </div>
    ),
    [amount, availableBalance],
  );

  const transactionSteps = [
    {
      label: "Withdraw Margin",
      async action() {
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
      inputForm={inputForm}
      reviewForm={reviewForm}
      validateInput={validateInput}
      transactionSteps={transactionSteps}
      resultForm={(p) => (
        <div className="space-y-4">
          <div className="p-4 rounded-lg">
            <p className="text-gray-300">Your withdrawal has been processed successfully.</p>
            <p className="text-white font-medium mt-2">
              Amount withdrawn: {amount} {paymentToken.symbol}
            </p>
          </div>
        </div>
      )}
    />
  );
};
