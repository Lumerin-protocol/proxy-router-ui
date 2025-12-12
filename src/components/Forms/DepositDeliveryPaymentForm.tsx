import { type FC, useCallback, useMemo, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAccount } from "wagmi";
import { useDepositDeliveryPayment } from "../../hooks/data/useDepositDeliveryPayment";
import { useGetFutureBalance } from "../../hooks/data/useGetFutureBalance";
import { useFuturesContractSpecs } from "../../hooks/data/useFuturesContractSpecs";
import { TransactionFormV2 as TransactionForm } from "./Shared/MultistepForm";
import { formatValue, paymentToken } from "../../lib/units";
import { parseUnits, type TransactionReceipt } from "viem";
import type { PositionBookPosition } from "../../hooks/data/usePositionBook";
import { POSITION_BOOK_QK, waitForBlockNumberPositionBook } from "../../hooks/data/usePositionBook";
import { useQueryClient } from "@tanstack/react-query";

interface DepositDeliveryPaymentFormProps {
  closeForm: () => void;
  deliveryDate: bigint;
  pricePerDay: bigint;
  totalContracts: number;
  positions: PositionBookPosition[];
}

interface InputValues {
  amount: string;
  quantity: number;
}

export const DepositDeliveryPaymentForm: FC<DepositDeliveryPaymentFormProps> = ({
  closeForm,
  deliveryDate,
  pricePerDay,
  totalContracts,
  positions,
}) => {
  const { address } = useAccount();
  const { depositDeliveryPaymentAsync } = useDepositDeliveryPayment();
  const futureBalance = useGetFutureBalance(address);
  const contractSpecsQuery = useFuturesContractSpecs();
  const deliveryDurationDays = contractSpecsQuery.data?.data?.deliveryDurationDays ?? 7;
  const qc = useQueryClient();

  // Filter unpaid positions
  const unpaidPositions = useMemo(() => {
    return positions.filter((p) => !p.isPaid);
  }, [positions]);

  const form = useForm<InputValues>({
    mode: "onBlur",
    reValidateMode: "onBlur",
    defaultValues: {
      amount: "",
      quantity: 1,
    },
  });

  const [quantity, setQuantity] = useState(1);

  // Calculate total amount based on price * quantity * deliveryDurationDays
  const calculatedAmount = useMemo(() => {
    const pricePerDayNum = Number(pricePerDay) / 1e6; // Convert from wei to USDC
    const totalAmount = pricePerDayNum * quantity * deliveryDurationDays;
    return totalAmount.toFixed(2);
  }, [pricePerDay, quantity, deliveryDurationDays]);

  // Calculate max quantity based on available balance
  const maxQuantity = useMemo(() => {
    if (!futureBalance.data) return unpaidPositions.length;
    const pricePerDayNum = Number(pricePerDay) / 1e6;
    const totalCostPerContract = pricePerDayNum * deliveryDurationDays;
    const balanceNum = Number(futureBalance.data) / 1e6;
    const maxAffordable = Math.floor(balanceNum / totalCostPerContract);
    return Math.min(maxAffordable, unpaidPositions.length);
  }, [futureBalance.data, pricePerDay, deliveryDurationDays, unpaidPositions.length]);

  // Update amount when quantity changes
  useEffect(() => {
    form.setValue("amount", calculatedAmount, { shouldValidate: true });
  }, [calculatedAmount, form]);

  // Update quantity when it changes
  const handleQuantityChange = useCallback(
    (value: number) => {
      const newQuantity = Math.max(1, Math.min(value, maxQuantity));
      setQuantity(newQuantity);
      form.setValue("quantity", newQuantity);
    },
    [maxQuantity, form],
  );

  const validateBalance = useCallback(
    (value: string): string | true => {
      if (!futureBalance.data) {
        return "Unable to fetch balance. Please try again.";
      }
      const amountBigInt = parseUnits(value, paymentToken.decimals);
      if (amountBigInt > futureBalance.data) {
        const balanceFormatted = formatValue(futureBalance.data, paymentToken).valueRounded;
        return `Insufficient balance. Available: ${balanceFormatted} ${paymentToken.symbol}`;
      }
      return true;
    },
    [futureBalance.data],
  );

  const validateQuantity = useCallback(
    (value: number): string | true => {
      if (value < 1) {
        return "Quantity must be at least 1";
      }
      if (value > unpaidPositions.length) {
        return `Quantity cannot exceed unpaid positions (${unpaidPositions.length})`;
      }
      if (value > maxQuantity) {
        return `Quantity cannot exceed affordable contracts (${maxQuantity}) based on available balance`;
      }
      return true;
    },
    [unpaidPositions.length, maxQuantity],
  );

  const handleMaxQuantityClick = useCallback(() => {
    handleQuantityChange(maxQuantity);
  }, [maxQuantity, handleQuantityChange]);

  const inputForm = useCallback(
    () => (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Number of Contracts to Pay</label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1}
              className="px-3 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
            >
              -
            </button>
            <input
              type="number"
              min={1}
              max={maxQuantity}
              value={quantity}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 1;
                handleQuantityChange(value);
              }}
              className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={quantity >= maxQuantity}
              className="px-3 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
            >
              +
            </button>
            <button
              type="button"
              onClick={handleMaxQuantityClick}
              disabled={maxQuantity === quantity}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700"
            >
              Max ({maxQuantity})
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Available: {maxQuantity} of {unpaidPositions.length} unpaid positions (limited by balance)
          </p>
        </div>
        {/* <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-300">Price per day:</span>
              <span className="text-white text-sm">{(Number(pricePerDay) / 1e6).toFixed(2)} USDC</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-300">Delivery duration:</span>
              <span className="text-white text-sm">{deliveryDurationDays} days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-300">Price per contract:</span>
              <span className="text-white text-sm">
                {((Number(pricePerDay) / 1e6) * deliveryDurationDays).toFixed(2)} USDC
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-700">
              <span className="text-sm font-medium text-gray-300">Total amount:</span>
              <span className="text-white font-semibold">{calculatedAmount} USDC</span>
            </div>
          </div>
        </div> */}
      </div>
    ),
    [
      form.control,
      validateBalance,
      quantity,
      maxQuantity,
      unpaidPositions.length,
      handleQuantityChange,
      handleMaxQuantityClick,
      pricePerDay,
      deliveryDurationDays,
      calculatedAmount,
    ],
  );

  const validateInput = useCallback(async () => {
    // Validate quantity
    const quantityValue = form.getValues("quantity");
    const quantityValidation = validateQuantity(quantityValue);
    if (quantityValidation !== true) {
      form.setError("quantity", {
        type: "validation",
        message: quantityValidation,
      });
      return false;
    }

    const amountValue = form.getValues("amount");
    if (!amountValue || parseFloat(amountValue) <= 0) {
      form.setError("amount", {
        type: "validation",
        message: "Deposit Amount must be a positive number",
      });
      return false;
    }

    // Check if balance is available
    if (!futureBalance.data) {
      form.setError("amount", {
        type: "validation",
        message: "Unable to fetch balance. Please try again.",
      });
      return false;
    }

    // Validate that amount doesn't exceed balance
    const amountBigInt = parseUnits(amountValue, paymentToken.decimals);
    if (amountBigInt > futureBalance.data) {
      const balanceFormatted = formatValue(futureBalance.data, paymentToken).valueRounded;
      form.setError("amount", {
        type: "validation",
        message: `Insufficient balance. Available: ${balanceFormatted} ${paymentToken.symbol}`,
      });
      return false;
    }

    return true;
  }, [form, futureBalance.data, validateQuantity]);

  const reviewForm = useCallback(
    () => (
      <>
        <div className="p-4 mb-2 rounded-lg bg-white-500/10 border border-white-500/20">
          <p className="text-white-400 text-sm font-medium mb-2">Important Information</p>
          <p className="text-gray-300 text-sm">
            This deposit is required if you are interested in actual hashrate delivery. The deposit must be completed
            before the delivery date.
          </p>
        </div>
        {inputForm()}
        <div className="space-y-4">
          <div className="p-4 rounded-lg">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Positions to pay:</span>
                <span className="text-white font-medium">
                  {quantity} of {unpaidPositions.length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Price per contract:</span>
                <span className="text-white font-medium">
                  {((Number(pricePerDay) / 1e6) * deliveryDurationDays).toFixed(2)} USDC
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Total amount:</span>
                <span className="text-white font-medium">{calculatedAmount} USDC</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Available balance:</span>
                <span className="text-white font-medium">
                  {futureBalance.isLoading ? (
                    <span>Loading...</span>
                  ) : (
                    <>
                      {futureBalance.data
                        ? Number(formatValue(futureBalance.data, paymentToken).valueRounded).toFixed(2)
                        : "0"}{" "}
                      {paymentToken.symbol}
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </>
    ),
    [
      inputForm,
      futureBalance.data,
      futureBalance.isLoading,
      quantity,
      unpaidPositions.length,
      pricePerDay,
      deliveryDurationDays,
      calculatedAmount,
    ],
  );

  const transactionSteps = useMemo(
    () => [
      {
        label: "Deposit Delivery Payment",
        async action() {
          // Select the first N unpaid positions based on quantity
          const selectedPositions = unpaidPositions.slice(0, quantity);
          const positionIds = selectedPositions.map((p) => p.id as `0x${string}`);

          if (positionIds.length === 0) {
            throw new Error("No positions selected");
          }

          const result = await depositDeliveryPaymentAsync({
            positionIds: positionIds,
          });
          return result ? { isSkipped: false, txhash: result } : { isSkipped: false };
        },
        postConfirmation: async (receipt: TransactionReceipt) => {
          // Wait for block number to ensure indexer has updated
          await waitForBlockNumberPositionBook(receipt.blockNumber, qc);

          // Refetch position book to update the positions lists
          await qc.invalidateQueries({ queryKey: [POSITION_BOOK_QK] });
        },
      },
    ],
    [unpaidPositions, quantity, depositDeliveryPaymentAsync, address, qc],
  );

  return (
    <TransactionForm
      onClose={closeForm}
      title="Deposit Delivery Payment"
      description="Deposit payment for hashrate delivery"
      reviewForm={reviewForm}
      validateInput={validateInput}
      transactionSteps={transactionSteps}
      resultForm={(p) => (
        <div className="space-y-4">
          <div className="p-4 rounded-lg">
            <p className="text-gray-300">Your deposit has been processed successfully.</p>
            <p className="text-white font-medium mt-2">
              Amount deposited: {form.getValues("amount")} {paymentToken.symbol}
            </p>
          </div>
        </div>
      )}
    />
  );
};
