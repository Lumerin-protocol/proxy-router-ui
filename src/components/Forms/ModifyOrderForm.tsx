import { memo, useCallback, type FC } from "react";
import { useForm, useController, type Control } from "react-hook-form";
import { waitForBlockNumber } from "../../hooks/data/useOrderBook";
import { TransactionFormV2 as TransactionForm } from "./Shared/MultistepForm";
import type { TransactionReceipt } from "viem";
import { useCreateOrder } from "../../hooks/data/useCreateOrder";
import { ORDER_BOOK_QK } from "../../hooks/data/useOrderBook";
import { PARTICIPANT_QK } from "../../hooks/data/useParticipant";
import { POSITION_BOOK_QK } from "../../hooks/data/usePositionBook";
import { useQueryClient } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import type { ParticipantOrder } from "../../hooks/data/useParticipant";
import styled from "@mui/material/styles/styled";
import { handleNumericDecimalInput } from "./Shared/AmountInputForm";

interface ModifyOrderFormProps {
  order: ParticipantOrder;
  orderIds: string[]; // IDs of orders to close (grouped orders)
  currentQuantity: number; // Current quantity of grouped orders
  closeForm: () => void;
}

interface ModifyFormValues {
  price: string;
  quantity: number;
}

export const ModifyOrderForm: FC<ModifyOrderFormProps> = memo(
  ({ order, orderIds, currentQuantity, closeForm }) => {
    const { createOrderAsync } = useCreateOrder();
    const qc = useQueryClient();
    const { address } = useAccount();

    // Determine order type from quantity sign
    const isBuy = order.isBuy;

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
      var values = form.getValues();
      if (values.quantity == currentQuantity && values.price == (Number(order.pricePerDay) / 1e6).toFixed(2)) {
        alert("Please change order terms");
        return false;
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
            <p className="text-gray-400 text-sm">
              You are about to modify your order. An opposite order will be created to close the old order, then a new
              order will be created with the updated values.
            </p>
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
            label: "Close Old Order",
            action: async () => {
              // Create an order with opposite sign to close the existing orders
              // If buy orders (isBuy = true), create sell order with negative quantity
              // If sell orders (isBuy = false), create buy order with positive quantity
              const oppositeQuantity = isBuy ? -currentQuantity : currentQuantity;

              const txhash = await createOrderAsync({
                price: order.pricePerDay,
                deliveryDate: order.deliveryAt,
                quantity: oppositeQuantity,
                destUrl: order.destURL,
              });

              return {
                isSkipped: false,
                txhash: txhash,
              };
            },
            postConfirmation: async (receipt: TransactionReceipt) => {
              await waitForBlockNumber(receipt.blockNumber, qc);
            },
          },
          {
            label: "Create New Order",
            action: async () => {
              const formValues = form.getValues();
              const priceBigInt = BigInt(Math.round(parseFloat(formValues.price) * 1e6));
              const signedQuantity = getSignedQuantity();
              const txhash = await createOrderAsync({
                price: priceBigInt,
                deliveryDate: order.deliveryAt,
                quantity: signedQuantity,
                destUrl: order.destURL,
              });
              return {
                isSkipped: false,
                txhash: txhash,
              };
            },
            postConfirmation: async (receipt: TransactionReceipt) => {
              // Wait for block number to ensure indexer has updated
              await waitForBlockNumber(receipt.blockNumber, qc);

              // Refetch order book, positions, and participant data
              await Promise.all([
                qc.invalidateQueries({ queryKey: [ORDER_BOOK_QK] }),
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
      prevProps.currentQuantity === nextProps.currentQuantity
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
        <label>Price, USDC</label>
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
