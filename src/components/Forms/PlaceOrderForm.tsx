import { memo, type FC, useCallback } from "react";
import { useForm, useController, type Control } from "react-hook-form";
import { waitForBlockNumber } from "../../hooks/data/useOrderBook";
import { TransactionForm } from "./Shared/MultistepForm";
import type { TransactionReceipt } from "viem";
import { useCreateOrder } from "../../hooks/data/useCreateOrder";
import { ORDER_BOOK_QK } from "../../hooks/data/useOrderBook";
import { PARTICIPANT_QK } from "../../hooks/data/useParticipant";
import { POSITION_BOOK_QK } from "../../hooks/data/usePositionBook";
import { useQueryClient } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { formatStratumUrl } from "../../utils/formatters";
import { isValidHost, isValidUsername } from "../../utils/validators";
import styled from "@mui/material/styles/styled";

interface PoolFormValues {
  poolAddress: string;
  username: string;
}

interface Props {
  price: bigint;
  deliveryDate: bigint;
  quantity: number; // Positive for Buy, Negative for Sell
  closeForm: () => void;
}

export const PlaceOrderForm: FC<Props> = ({ price, deliveryDate, quantity, closeForm }) => {
  const { createOrderAsync } = useCreateOrder();
  const qc = useQueryClient();
  const { address } = useAccount();

  // Determine order type from quantity sign
  const isBuy = quantity > 0;
  const absoluteQuantity = Math.abs(quantity);

  // Form setup for pool address and username (optional for buy orders)
  const form = useForm<PoolFormValues>({
    mode: "onBlur",
    reValidateMode: "onBlur",
    defaultValues: {
      poolAddress: "",
      username: "",
    },
  });

  // Optional input form for buy orders to set pool address and username
  // Use useCallback to prevent recreation on each render, which causes input focus loss
  const inputForm = useCallback(() => <PoolInputForm key="pool-input-form" control={form.control} />, [form.control]);

  // Construct stratum URL if pool address is provided
  const getDestUrl = (): string => {
    if (!isBuy) {
      return "";
    }

    const formValues = form.getValues();
    const poolAddress = formValues.poolAddress;
    const username = formValues.username;

    if (!poolAddress) {
      return "";
    }

    // If both pool address and username are provided, construct stratum URL
    if (poolAddress && username) {
      return formatStratumUrl({
        host: poolAddress,
        username: username,
      });
    }

    // If only pool address is provided, construct URL without username
    if (poolAddress) {
      return formatStratumUrl({
        host: poolAddress,
      });
    }

    return "";
  };

  return (
    <TransactionForm
      onClose={closeForm}
      title={isBuy ? "Place Buy Order" : "Place Sell Order"}
      description={""}
      inputForm={isBuy ? inputForm : undefined}
      validateInput={
        isBuy
          ? async () => {
              const result = await form.trigger();
              return result;
            }
          : undefined
      }
      reviewForm={(props) => (
        <>
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Order Details:</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-300">Type:</span>
                <span className="text-white">{isBuy ? "Buy" : "Sell"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Price:</span>
                <span className="text-white">{Number(price) / 1e6} USDC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Quantity:</span>
                <span className="text-white">{absoluteQuantity} units</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Delivery Date:</span>
                <span className="text-white">{new Date(Number(deliveryDate) * 1000).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Total Value:</span>
                <span className="text-white">{((Number(price) / 1e6) * absoluteQuantity).toFixed(2)} USDC</span>
              </div>
              {isBuy &&
                (() => {
                  const formValues = form.getValues();
                  return (
                    <>
                      {formValues.poolAddress && (
                        <div className="flex justify-between">
                          <span className="text-gray-300">Pool Address:</span>
                          <span className="text-white">{formValues.poolAddress}</span>
                        </div>
                      )}
                      {formValues.username && (
                        <div className="flex justify-between">
                          <span className="text-gray-300">Username:</span>
                          <span className="text-white">{formValues.username}</span>
                        </div>
                      )}
                    </>
                  );
                })()}
            </div>
          </div>
          <p className="text-gray-400 text-sm">
            You are about to place a {isBuy ? "buy" : "sell"} order. Please review the details above.
          </p>
        </>
      )}
      resultForm={(props) => (
        <>
          <h2 className="w-6/6 text-left font-semibold mb-3">Order created successfully!</h2>
          <p className="w-6/6 text-left font-normal text-s">
            Your order has been placed and will appear in the order book shortly.
          </p>
        </>
      )}
      transactionSteps={[
        {
          label: `Place ${isBuy ? "Buy" : "Sell"} Order`,
          action: async () => {
            const destUrl = getDestUrl();
            const txhash = await createOrderAsync({
              price,
              deliveryDate,
              quantity,
              destUrl,
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
};

const PoolInputContainer = styled("div")`
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
const PoolInputForm = memo<{
  control: Control<PoolFormValues>;
}>(({ control }) => {
  const poolAddressController = useController({
    name: "poolAddress",
    control: control,
    rules: {
      validate: (poolAddress: string) => {
        if (!poolAddress) {
          return true; // Optional field
        }
        if (isValidHost(poolAddress)) {
          return true;
        }
        return "Pool address should have the format: mypool.com:3333";
      },
    },
  });

  const usernameController = useController({
    name: "username",
    control: control,
    rules: {
      validate: (username: string) => {
        if (!username) {
          return true; // Optional field
        }
        if (isValidUsername(username)) {
          return true;
        }
        return "Invalid username. Only letters a-z, numbers and .@- allowed";
      },
    },
  });

  return (
    <PoolInputContainer>
      <p className="text-gray-400 text-sm mb-4">
        Configure the pool address and username to which your purchased hashpower will be directed.
      </p>
      <InputGroup>
        <label>Pool Address</label>
        <input type="text" {...poolAddressController.field} placeholder="mypool.com:3333" />
        {poolAddressController.fieldState.error && (
          <ErrorText>{poolAddressController.fieldState.error.message}</ErrorText>
        )}
      </InputGroup>
      <InputGroup>
        <label>Username</label>
        <input type="text" {...usernameController.field} placeholder="account.worker" />
        {usernameController.fieldState.error && <ErrorText>{usernameController.fieldState.error.message}</ErrorText>}
      </InputGroup>
    </PoolInputContainer>
  );
});

PoolInputForm.displayName = "PoolInputForm";
