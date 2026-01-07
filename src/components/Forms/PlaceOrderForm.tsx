import { memo, type FC, useCallback, useState, useEffect } from "react";
import { useForm, useController, useWatch, type Control } from "react-hook-form";
import { waitForAggregateBlockNumber, AGGREGATE_ORDER_BOOK_QK } from "../../hooks/data/useAggregateOrderBook";
import { TransactionFormV2 as TransactionForm } from "./Shared/MultistepForm";
import type { TransactionReceipt } from "viem";
import { useCreateOrder } from "../../hooks/data/useCreateOrder";
import { PARTICIPANT_QK } from "../../hooks/data/useParticipant";
import { POSITION_BOOK_QK } from "../../hooks/data/usePositionBook";
import { useQueryClient } from "@tanstack/react-query";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { formatStratumUrl } from "../../utils/formatters";
import { isValidHost, isValidUsername } from "../../utils/validators";
import styled from "@mui/material/styles/styled";
import type { Participant } from "../../hooks/data/useParticipant";
import { useFuturesContractSpecs } from "../../hooks/data/useFuturesContractSpecs";
import { calculateMinMargin } from "../../hooks/data/useGetMinMarginForPosition";
import { getMinMarginForPositionManual } from "../../hooks/data/getMinMarginForPositionManual";
import { predefinedPools } from "./BuyerForms/predefinedPools";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import { useOrderFee } from "../../hooks/data/useOrderFee";

interface PoolFormValues {
  predefinedPoolIndex: number | "";
  poolAddress: string;
  username: string;
}

interface Props {
  price: bigint;
  deliveryDate: bigint;
  quantity: number; // Positive for Buy, Negative for Sell
  participantData?: Participant | null;
  latestPrice: bigint | null;
  onOrderPlaced?: () => void | Promise<void>;
  closeForm: () => void;
  bypassConflictCheck?: boolean; // Allow proceeding despite conflicting orders
}

export const PlaceOrderForm: FC<Props> = ({
  price,
  deliveryDate,
  quantity,
  participantData,
  latestPrice,
  onOrderPlaced,
  closeForm,
  bypassConflictCheck = false,
}) => {
  const { createOrderAsync } = useCreateOrder();
  const qc = useQueryClient();
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const contractSpecsQuery = useFuturesContractSpecs();
  const { orderFeeUSDC, isLoading: isOrderFeeLoading } = useOrderFee();

  // Determine order type from quantity sign
  const isBuy = quantity > 0;
  const absoluteQuantity = Math.abs(quantity);
  const deliveryDurationDays = contractSpecsQuery.data?.data?.deliveryDurationDays ?? 7;
  const marginPersent = contractSpecsQuery.data?.data?.liquidationMarginPercent ?? 20;

  // State for required margin
  const [requiredMargin, setRequiredMargin] = useState<bigint | null>(null);
  const [isLoadingMargin, setIsLoadingMargin] = useState(false);

  // Calculate required margin when price or quantity changes
  useEffect(() => {
    if (!latestPrice) return;
    setIsLoadingMargin(true);
    const margin = getMinMarginForPositionManual(price, quantity, latestPrice, marginPersent, deliveryDurationDays);
    setRequiredMargin(margin);
    setIsLoadingMargin(false);
  }, [latestPrice, price, quantity]);

  // Check for conflicting orders (opposite action, same price, same delivery date)
  const hasConflictingOrder = () => {
    if (!participantData?.orders) return false;

    const priceInWei = price;
    const deliveryDateValue = deliveryDate;
    const oppositeIsBuy = !isBuy;

    return participantData.orders.some(
      (order) =>
        order.isActive &&
        order.isBuy === oppositeIsBuy &&
        order.pricePerDay === priceInWei &&
        order.deliveryAt === deliveryDateValue,
    );
  };

  // State for checkbox to show pool input form
  const [hidePoolInput, setHidePoolInput] = useState(true);

  // Form setup for pool address and username (optional for buy orders)
  const form = useForm<PoolFormValues>({
    mode: "onBlur",
    reValidateMode: "onBlur",
    defaultValues: {
      predefinedPoolIndex: "" as const,
      poolAddress: "",
      username: "",
    },
  });

  // Optional input form for buy orders to set pool address and username
  // Use useCallback to prevent recreation on each render, which causes input focus loss
  const inputForm = useCallback(
    () => (
      <PoolInputForm
        key="pool-input-form"
        control={form.control}
        setValue={form.setValue}
        resetField={form.resetField}
      />
    ),
    [form.control, form.setValue, form.resetField],
  );

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
      title={isBuy ? "Place Bid Order" : "Place Ask Order"}
      description={""}
      validateInput={
        isBuy && !hidePoolInput
          ? async () => {
              const result = await form.trigger();
              return result;
            }
          : undefined
      }
      reviewForm={(props) => (
        <>
          <div className="mb-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-300">Price Per Day:</span>
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
                <span className="text-white">
                  {((Number(price) / 1e6) * absoluteQuantity * deliveryDurationDays).toFixed(2)} USDC
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Expected Hashrate:</span>
                <span className="text-white">{absoluteQuantity * 100} Th/s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Required Margin:</span>
                <span className="text-white">
                  {requiredMargin !== null
                    ? `${(Math.abs(Number(requiredMargin)) / 1e6).toFixed(2)} USDC`
                    : isLoadingMargin
                      ? "Loading..."
                      : "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Order Creation Fee:</span>
                <span className="text-white">
                  {orderFeeUSDC !== null ? `${orderFeeUSDC.toFixed(2)} USDC` : isOrderFeeLoading ? "Loading..." : "N/A"}
                </span>
              </div>
            </div>
          </div>
          {isBuy && (
            <div className="mb-4">
              <CheckboxContainer>
                <CheckboxInput
                  type="checkbox"
                  id="no-hashrate-checkbox"
                  checked={hidePoolInput}
                  onChange={(e) => setHidePoolInput(e.target.checked)}
                />
                <CheckboxLabel htmlFor="no-hashrate-checkbox">I do not intend to receive hashrate.</CheckboxLabel>
              </CheckboxContainer>
              {!hidePoolInput && <div className="mt-4">{inputForm()}</div>}
            </div>
          )}
          <p className="text-gray-400 text-sm">
            You are about to place a {isBuy ? "bid" : "ask"} order. Please review the details above.
          </p>
        </>
      )}
      resultForm={(props) => (
        <>
          <p className="w-6/6 text-left font-normal text-s mt-5">
            Your order has been placed and will appear in the order book shortly.
          </p>
        </>
      )}
      transactionSteps={[
        {
          label: `Place ${isBuy ? "Bid" : "Ask"} Order`,
          action: async () => {
            // Check for conflicting order before proceeding (unless bypassed)
            if (!bypassConflictCheck && hasConflictingOrder()) {
              const oppositeAction = isBuy ? "Ask" : "Bid";
              const priceInUSDC = Number(price) / 1e6;
              throw new Error(
                `Cannot create ${isBuy ? "Bid" : "Ask"} order at price ${priceInUSDC} USDC. You already have an active ${oppositeAction} order at the same price and delivery date. Please close or modify the existing order first.`,
              );
            }

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
            await waitForAggregateBlockNumber(receipt.blockNumber, qc, Number(deliveryDate));

            // Refetch order book, positions, and participant data
            await Promise.all([
              qc.invalidateQueries({ queryKey: [AGGREGATE_ORDER_BOOK_QK] }),
              address && qc.invalidateQueries({ queryKey: [POSITION_BOOK_QK] }),
              address && qc.invalidateQueries({ queryKey: [PARTICIPANT_QK] }),
            ]);

            if (onOrderPlaced) {
              await onOrderPlaced();
            }
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

const PoolSelectWrapper = styled("div")`
  .MuiTextField-root {
    width: 100%;
  }
  
  .MuiInputBase-root {
    background: rgba(255, 255, 255, 0.05);
    color: #fff;
    
    &:hover {
      background: rgba(255, 255, 255, 0.08);
    }
  }
  
  .MuiInputLabel-root {
    color: #a7a9b6;
  }
  
  .MuiOutlinedInput-notchedOutline {
    border-color: rgba(255, 255, 255, 0.2);
  }
  
  .MuiSelect-icon {
    color: #a7a9b6;
  }
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
    min-width: 65px;

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

const CheckboxContainer = styled("div")`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.05);
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.3);
  }
`;

const CheckboxInput = styled("input")`
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #509EBA;
`;

const CheckboxLabel = styled("label")`
  font-size: 0.875rem;
  color: #fff;
  cursor: pointer;
  user-select: none;
`;

// Helper function to determine pool type
function getPoolType(predefinedPoolIndex: number | ""): "manual" | "pool" | null {
  if (predefinedPoolIndex === "") {
    return null;
  }
  if (predefinedPoolIndex === -1) {
    return "manual";
  }
  return "pool";
}

// Separate memoized component to prevent input focus loss
const PoolInputForm = memo<{
  control: Control<PoolFormValues>;
  setValue: (name: keyof PoolFormValues, value: string) => void;
  resetField: (name: keyof PoolFormValues) => void;
}>(({ control, setValue, resetField }) => {
  const predefinedPoolController = useController({
    name: "predefinedPoolIndex",
    control: control,
    rules: {
      required: "Please select a pool",
      onChange: (event) => {
        const value = event.target.value;
        const poolType = getPoolType(value);

        if (poolType === "pool") {
          setValue("poolAddress", predefinedPools[value].address);
        }

        if (poolType === "manual") {
          resetField("poolAddress");
        }
      },
    },
  });

  const poolAddressController = useController({
    name: "poolAddress",
    control: control,
    rules: {
      required: "Pool Address is required",
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

  const predefinedPoolIndex = useWatch({ control, name: "predefinedPoolIndex" });
  const isManualPool = predefinedPoolIndex !== "" && getPoolType(predefinedPoolIndex) === "manual";

  return (
    <PoolInputContainer>
      <p className="text-gray-400 text-sm mb-4">
        Configure the pool address and username to which your purchased hashpower will be directed.
      </p>
      <PoolSelectWrapper>
        <TextField
          select
          {...predefinedPoolController.field}
          label="Predefined Pools"
          error={!!predefinedPoolController.fieldState.error}
          helperText={predefinedPoolController.fieldState.error?.message}
          fullWidth
        >
          {predefinedPools.map((item, index) =>
            item.isLightning ? null : (
              <MenuItem key={item.name} value={index}>
                {item.name}
              </MenuItem>
            ),
          )}
          <MenuItem key="-1" value={-1}>
            Manually enter pool address
          </MenuItem>
        </TextField>
      </PoolSelectWrapper>
      <InputGroup>
        <label>Pool Address</label>
        <input type="text" {...poolAddressController.field} placeholder="mypool.com:3333" disabled={!isManualPool} />
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
