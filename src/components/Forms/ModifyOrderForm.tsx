import { memo, useCallback, useState, type FC } from "react";
import { useForm, useController, type Control } from "react-hook-form";
import { waitForAggregateBlockNumber, AGGREGATE_ORDER_BOOK_QK } from "../../hooks/data/useAggregateOrderBook";
import { TransactionFormV2 as TransactionForm } from "./Shared/MultistepForm";
import type { TransactionReceipt } from "viem";
import { useModifyOrder } from "../../hooks/data/useModifyOrder";
import { PARTICIPANT_QK } from "../../hooks/data/useParticipant";
import { POSITION_BOOK_QK } from "../../hooks/data/usePositionBook";
import { useQueryClient } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import type { ParticipantOrder, Participant } from "../../hooks/data/useParticipant";
import styled from "@mui/material/styles/styled";
import { handleNumericDecimalInput } from "./Shared/AmountInputForm";
import { getMinMarginForPositionManual } from "../../hooks/data/getMinMarginForPositionManual";
import { useGetFutureBalance } from "../../hooks/data/useGetFutureBalance";
import { usePaymentTokenBalance } from "../../hooks/data/usePaymentTokenBalance";
import { useOrderFee } from "../../hooks/data/useOrderFee";

interface ModifyOrderFormProps {
  order: ParticipantOrder;
  orderIds: string[]; // IDs of orders to close (grouped orders)
  currentQuantity: number; // Current quantity of grouped orders
  closeForm: () => void;
  participantData?: Participant | null;
  latestPrice: bigint | null;
  marginPercent: number;
  deliveryDurationDays: number;
  minMargin?: bigint | null;
  newestItemPrice: number | null;
}

interface ModifyFormValues {
  price: string;
  quantity: number;
}

export const ModifyOrderForm: FC<ModifyOrderFormProps> = memo(
  ({
    order,
    orderIds,
    currentQuantity,
    closeForm,
    participantData,
    latestPrice,
    marginPercent,
    deliveryDurationDays,
    minMargin,
    newestItemPrice,
  }) => {
    const { modifyOrderAsync } = useModifyOrder();
    const qc = useQueryClient();
    const { address } = useAccount();
    const balanceQuery = useGetFutureBalance(address);
    const accountBalanceQuery = usePaymentTokenBalance(address);
    const { data: orderFeeRaw } = useOrderFee();

    // Determine order type from quantity sign
    const isBuy = order.isBuy;

    // Get high price percentage from environment variable (default 60 for 160%)
    const highPricePercentage = Number(process.env.REACT_APP_FUTURES_HIGH_PRICE_PERCENTAGE || "60");
    const maxPriceMultiplier = 1 + highPricePercentage / 100;

    // Form setup with default values from current order
    const form = useForm<ModifyFormValues>({
      mode: "onBlur",
      reValidateMode: "onBlur",
      defaultValues: {
        price: (Number(order.pricePerDay) / 1e6).toFixed(2),
        quantity: currentQuantity,
      },
    });

    const validateInput = async (): Promise<boolean> => {
      const result = await form.trigger();
      if (!result) {
        const errors = form.formState.errors;
        if (errors.price) {
          alert(errors.price.message || "Please enter a valid price");
        } else if (errors.quantity) {
          alert(errors.quantity.message || "Please enter a valid quantity");
        } else {
          alert("Please fix the form errors");
        }
        return false;
      }

      const values = form.getValues();
      if (values.quantity == currentQuantity && values.price == (Number(order.pricePerDay) / 1e6).toFixed(2)) {
        alert("Please change order terms");
        return false;
      }

      // Validate balance for modified order
      const newPrice = parseFloat(values.price);
      const newPriceInWei = BigInt(Math.round(newPrice * 1e6));
      const newQuantity = values.quantity;
      const totalBalance = balanceQuery.data ?? 0n;
      const lockedBalance = minMargin ?? 0n;
      const availableBalance = totalBalance - lockedBalance;

      if (!latestPrice) {
        alert("Unable to fetch market price. Please try again.");
        return false;
      }

      // Calculate required margin for the new order
      const newSignedQuantity = isBuy ? newQuantity : -newQuantity;
      const requiredMargin = getMinMarginForPositionManual(
        newPriceInWei,
        newSignedQuantity,
        latestPrice,
        marginPercent,
        deliveryDurationDays,
      );

      // Include order fee in the balance check
      const orderFee = orderFeeRaw ?? 0n;
      const totalRequired = requiredMargin + orderFee;

      if (totalRequired > availableBalance) {
        const requiredMarginFormatted = (Number(requiredMargin) / 1e6).toFixed(2);
        const orderFeeFormatted = (Number(orderFee) / 1e6).toFixed(2);
        const totalRequiredFormatted = (Number(totalRequired) / 1e6).toFixed(2);
        const totalBalanceFormatted = (Number(totalBalance) / 1e6).toFixed(2);
        const lockedBalanceFormatted = (Number(lockedBalance) / 1e6).toFixed(2);
        const availableBalanceFormatted = (Number(availableBalance) / 1e6).toFixed(2);
        const accountBalance = accountBalanceQuery.data ?? 0n;
        const accountBalanceFormatted = (Number(accountBalance) / 1e6).toFixed(2);
        alert(
          `Insufficient funds. Please deposit futures account.\n\nRequired margin: ${requiredMarginFormatted} USDC\nOrder fee: ${orderFeeFormatted} USDC\nTotal required: ${totalRequiredFormatted} USDC\nTotal futures balance: ${totalBalanceFormatted} USDC\nLocked balance: ${lockedBalanceFormatted} USDC\nAvailable balance: ${availableBalanceFormatted} USDC\nAvailable account balance: ${accountBalanceFormatted} USDC`,
        );
        return false;
      }

      // Check for conflicting orders (opposite action, same price, same delivery date)
      if (participantData?.orders) {
        const deliveryDateValue = order.deliveryAt;
        const conflictingOrder = participantData.orders.find(
          (existingOrder) =>
            existingOrder.isActive &&
            existingOrder.isBuy !== isBuy && // Opposite action
            existingOrder.pricePerDay === newPriceInWei &&
            existingOrder.deliveryAt === deliveryDateValue &&
            existingOrder.id !== order.id, // Exclude the current order being modified
        );

        if (conflictingOrder) {
          const oppositeAction = isBuy ? "Sell" : "Buy";
          alert(
            `Cannot modify order to price ${newPrice.toFixed(2)} USDC. You already have an active ${oppositeAction} order at the same price and delivery date. Please close or modify the existing order first.`,
          );
          return false;
        }
      }

      // Check if price exceeds the configured percentage of newest item price
      if (newestItemPrice) {
        const maxAllowedPrice = newestItemPrice * maxPriceMultiplier;
        if (newPrice > maxAllowedPrice) {
          const percentageOver = ((newPrice / newestItemPrice) * 100).toFixed(1);
          const confirmed = window.confirm(
            `⚠️ High Price Warning\n\nYour price (${newPrice.toFixed(2)} USDC) is ${percentageOver}% of the market price (${newestItemPrice.toFixed(2)} USDC).\n\nThis price is significantly above the current market rate. You may experience difficulty finding a counterparty or may face higher slippage.\n\nDo you want to proceed?`,
          );
          if (!confirmed) {
            return false;
          }
        }
      }

      return true;
    };

    // Memoize input form to prevent recreation on each render
    const inputForm = useCallback(
      () => <ModifyInputForm key="modify-input-form" control={form.control} />,
      [form.control],
    );

    // Convert quantity to signed int8 (positive for Buy, negative for Sell)
    const getSignedQuantity = () => {
      const quantity = form.getValues("quantity");
      return isBuy ? quantity : -quantity;
    };

    return (
      <TransactionForm
        onClose={closeForm}
        title="Modify Order"
        description="Update the price and quantity for your order"
        inputForm={inputForm}
        validateInput={validateInput}
        reviewForm={(props) => (
          <>
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Current Order:</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">Type:</span>
                  <span className="text-white">{isBuy ? "Buy" : "Sell"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Price:</span>
                  <span className="text-white">{Number(order.pricePerDay) / 1e6} USDC</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Quantity:</span>
                  <span className="text-white">{currentQuantity} units</span>
                </div>
              </div>
            </div>
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Modified Order:</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">Type:</span>
                  <span className="text-white">{isBuy ? "Buy" : "Sell"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Price:</span>
                  <span className="text-white">{parseFloat(form.watch("price")).toFixed(2)} USDC</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Quantity:</span>
                  <span className="text-white">{form.watch("quantity")} units</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Delivery Date:</span>
                  <span className="text-white">{new Date(Number(order.deliveryAt) * 1000).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Total Value:</span>
                  <span className="text-white">
                    {(parseFloat(form.watch("price")) * form.watch("quantity")).toFixed(2)} USDC
                  </span>
                </div>
              </div>
            </div>
            <p className="text-gray-400 text-sm">You are about to modify your order.</p>
          </>
        )}
        resultForm={(props) => (
          <>
            <p className="w-6/6 text-left font-normal text-s mt-5">
              Your order has been updated and will appear in the order book shortly.
            </p>
          </>
        )}
        transactionSteps={[
          {
            label: "Modify Order",
            action: async () => {
              const formValues = form.getValues();
              const newPriceBigInt = BigInt(Math.round(parseFloat(formValues.price) * 1e6));
              const newSignedQuantity = getSignedQuantity();

              // Determine old quantity with sign
              const oldSignedQuantity = isBuy ? currentQuantity : -currentQuantity;

              const txhash = await modifyOrderAsync({
                oldPrice: order.pricePerDay,
                oldQuantity: oldSignedQuantity,
                newPrice: newPriceBigInt,
                newQuantity: newSignedQuantity,
                destUrl: order.destURL,
                deliveryDate: order.deliveryAt,
              });

              return {
                isSkipped: false,
                txhash: txhash,
              };
            },
            postConfirmation: async (receipt: TransactionReceipt) => {
              // Wait for block number to ensure indexer has updated
              await waitForAggregateBlockNumber(receipt.blockNumber, qc, Number(order.deliveryAt));

              // Refetch order book, positions, and participant data
              await Promise.all([
                qc.invalidateQueries({ queryKey: [AGGREGATE_ORDER_BOOK_QK] }),
                address && qc.invalidateQueries({ queryKey: [POSITION_BOOK_QK] }),
                address && qc.invalidateQueries({ queryKey: [PARTICIPANT_QK] }),
              ]);
            },
          },
        ]}
      />
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.order.id === nextProps.order.id &&
      prevProps.orderIds.length === nextProps.orderIds.length &&
      prevProps.currentQuantity === nextProps.currentQuantity &&
      prevProps.latestPrice === nextProps.latestPrice &&
      prevProps.marginPercent === nextProps.marginPercent &&
      prevProps.deliveryDurationDays === nextProps.deliveryDurationDays &&
      prevProps.minMargin === nextProps.minMargin &&
      prevProps.newestItemPrice === nextProps.newestItemPrice
    );
  },
);

const InputFormContainer = styled("div")`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 1rem;
`;

const InputGroup = styled("div")`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  label {
    font-size: 0.875rem;
    font-weight: 500;
    color: #a7a9b6;
  }

  input {
    padding: 0.75rem;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.05);
    color: #fff;
    font-size: 1rem;
    transition: border-color 0.2s ease, background-color 0.2s ease;
    width: 100%;

    &:focus {
      outline: none;
      border-color: #509EBA;
      background: rgba(255, 255, 255, 0.08);
    }

    &::placeholder {
      color: #6b7280;
    }
  }
`;

const ErrorText = styled("span")`
  color: #ef4444;
  font-size: 0.75rem;
  margin-top: -0.25rem;
`;

// Separate memoized component to prevent input focus loss
const ModifyInputForm = memo<{
  control: Control<ModifyFormValues>;
}>(({ control }) => {
  const priceController = useController({
    name: "price",
    control: control,
    rules: {
      required: "Price is required",
      validate: (value: string) => {
        const numValue = parseFloat(value);
        if (isNaN(numValue) || numValue <= 0) {
          return "Price must be greater than 0";
        }
        return true;
      },
    },
  });

  const quantityController = useController({
    name: "quantity",
    control: control,
    rules: {
      required: "Quantity is required",
      min: 1,
      max: 50,
      validate: (value: number) => {
        if (value <= 0 || value > 127) {
          return "Quantity must be between 1 and 127";
        }
        return true;
      },
    },
  });

  return (
    <InputFormContainer>
      <InputGroup>
        <label>Price (USDC)</label>
        <input
          type="text"
          {...priceController.field}
          step="0.01"
          min="0.01"
          onBeforeInput={handleNumericDecimalInput}
          inputMode={"numeric"}
        />
        {priceController.fieldState.error && <ErrorText>{priceController.fieldState.error.message}</ErrorText>}
      </InputGroup>

      <InputGroup>
        <label>Quantity</label>
        <input
          type="number"
          value={quantityController.field.value}
          onChange={(e) => {
            const value = e.target.value;
            if (value === "") {
              quantityController.field.onChange(0);
            } else {
              const numValue = parseInt(value, 10);
              if (!isNaN(numValue) && numValue >= 0 && numValue <= 127) {
                quantityController.field.onChange(numValue);
              }
            }
          }}
          onBlur={quantityController.field.onBlur}
          name={quantityController.field.name}
          min="1"
          max="127"
          placeholder="1"
        />
        {quantityController.fieldState.error && <ErrorText>{quantityController.fieldState.error.message}</ErrorText>}
      </InputGroup>
    </InputFormContainer>
  );
});

ModifyInputForm.displayName = "ModifyInputForm";
