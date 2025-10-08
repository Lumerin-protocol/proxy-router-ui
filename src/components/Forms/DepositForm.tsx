import { type FC, useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { useAccount } from "wagmi";
import { useAddMargin, useApproveAddMargin } from "../../hooks/data/useAddMargin";
import { usePaymentTokenBalance } from "../../hooks/data/usePaymentTokenBalance";
import { useApproveERC20 } from "../../hooks/data/useApproveERC20";
import { TransactionForm } from "./Shared/MultistepForm";
import { AmountInputForm } from "./Shared/AmountInputForm";
import { formatValue, paymentToken } from "../../lib/units";
import { parseUnits } from "viem";

interface DepositFormProps {
  closeForm: () => void;
}

interface InputValues {
  amount: string;
}

export const DepositForm: FC<DepositFormProps> = ({ closeForm }) => {
  const { address } = useAccount();
  const { addMarginAsync } = useAddMargin();
  const { approveAsync } = useApproveAddMargin();

  const paymentTokenBalance = usePaymentTokenBalance(address);

  const form = useForm<InputValues>({
    mode: "onBlur",
    reValidateMode: "onBlur",
    defaultValues: {
      amount: "",
    },
  });

  const [amount, setAmount] = useState<string>("");

  const inputForm = useCallback(
    () => <AmountInputForm control={form.control} label="Deposit Amount" />,
    [form.control],
  );

  const validateInput = useCallback(async () => {
    const amountValue = form.getValues("amount");
    if (!amountValue || parseFloat(amountValue) <= 0) {
      return false;
    }
    setAmount(amountValue);
    return true;
  }, [form]);

  const reviewForm = useCallback(
    () => (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Review Deposit</h3>
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-300">Amount to deposit:</span>
            <span className="text-white font-medium">
              {amount} {paymentToken.symbol}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Current balance:</span>
            <span className="text-white font-medium">
              {paymentTokenBalance.data ? formatValue(paymentTokenBalance.data, paymentToken).valueRounded : "0"}{" "}
              {paymentToken.symbol}
            </span>
          </div>
        </div>
      </div>
    ),
    [amount, paymentTokenBalance.data],
  );

  const transactionSteps = [
    {
      label: "Approve Token",
      async action() {
        if (!amount) throw new Error("Amount not set");
        const amountBigInt = parseUnits(amount, paymentToken.decimals);
        const result = await approveAsync({
          spender: process.env.REACT_APP_FUTURES_TOKEN_ADDRESS as `0x${string}`,
          amount: amountBigInt,
        });
        return result ? { isSkipped: false, txhash: result } : { isSkipped: true };
      },
    },
    {
      label: "Deposit Margin",
      async action() {
        if (!amount) throw new Error("Amount not set");
        const amountBigInt = parseUnits(amount, paymentToken.decimals);
        const result = await addMarginAsync({ amount: amountBigInt });
        return result ? { isSkipped: false, txhash: result } : { isSkipped: false };
      },
    },
  ];

  return (
    <TransactionForm
      onClose={closeForm}
      title="Deposit Margin"
      description="Add margin to your futures account"
      inputForm={inputForm}
      reviewForm={reviewForm}
      validateInput={validateInput}
      transactionSteps={transactionSteps}
    />
  );
};
