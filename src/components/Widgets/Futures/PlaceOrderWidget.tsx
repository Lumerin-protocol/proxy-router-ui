import styled from "@mui/material/styles/styled";
import { keyframes, css } from "@emotion/react";
import { SmallWidget } from "../../Cards/Cards.styled";
import { useState, useEffect } from "react";

// Pulsing background animation - single blue color for all inputs
const pulseYellow = keyframes`
  0%, 100% {
    background-color: rgba(251, 191, 36, 0.15);
  }
  50% {
    background-color: rgba(251, 191, 36, 0.45);
  }
`;

const getPulseAnimation = (isHighlighted?: boolean) => {
  if (isHighlighted) {
    return css`${pulseYellow} 1.5s ease-in-out infinite`;
  }
  return "none";
};
import { useGetMarketPrice } from "../../../hooks/data/useGetMarketPrice";
import { Spinner } from "../../Spinner.styled";
import { ModalItem } from "../../Modal";
import { PrimaryButton, SecondaryButton } from "../../Forms/FormButtons/Buttons.styled";
import { PlaceOrderForm } from "../../Forms/PlaceOrderForm";
import type { UseQueryResult } from "@tanstack/react-query";
import type { GetResponse } from "../../../gateway/interfaces";
import type { FuturesContractSpecs } from "../../../hooks/data/useFuturesContractSpecs";
import type { Participant } from "../../../hooks/data/useParticipant";
import { useAccount } from "wagmi";
import { useGetFutureBalance } from "../../../hooks/data/useGetFutureBalance";
import { getMinMarginForPositionManual } from "../../../hooks/data/getMinMarginForPositionManual";
import { handleNumericDecimalInput } from "../../Forms/Shared/AmountInputForm";
import { usePaymentTokenBalance } from "../../../hooks/data/usePaymentTokenBalance";
import { useOrderFee } from "../../../hooks/data/useOrderFee";

interface PlaceOrderWidgetProps {
  externalPrice?: string;
  externalAmount?: number;
  externalDeliveryDate?: number;
  externalIsBuy?: boolean;
  highlightTrigger?: number;
  address?: `0x${string}`;
  contractSpecsQuery: UseQueryResult<GetResponse<FuturesContractSpecs>, Error>;
  participantData?: Participant | null;
  latestPrice: bigint | null;
  highlightMode: "inputs" | "buttons" | undefined;
  onOrderPlaced?: () => void | Promise<void>;
  minMargin?: bigint | null;
}

export const PlaceOrderWidget = ({
  externalPrice,
  externalAmount,
  externalDeliveryDate,
  externalIsBuy,
  highlightTrigger,
  contractSpecsQuery,
  participantData,
  latestPrice,
  highlightMode,
  onOrderPlaced,
  minMargin,
}: PlaceOrderWidgetProps) => {
  const { data: marketPrice, isLoading: isMarketPriceLoading } = useGetMarketPrice();
  const { address } = useAccount();
  const balanceQuery = useGetFutureBalance(address);
  const accountBalanceQuery = usePaymentTokenBalance(address);
  const { data: orderFeeRaw } = useOrderFee();

  // Calculate price step from contract specs
  const priceStep = contractSpecsQuery.data?.data?.minimumPriceIncrement
    ? Number(contractSpecsQuery.data.data.minimumPriceIncrement) / 1e6
    : null;

  // Get delivery duration days from contract specs
  const deliveryDurationDays = contractSpecsQuery.data?.data?.deliveryDurationDays ?? 7;
  const marginPercent = contractSpecsQuery.data?.data?.liquidationMarginPercent ?? 20;

  // Get market price for validation and default price
  const newestItemPrice = marketPrice ? Number(marketPrice) / 1e6 : null;

  const [price, setPrice] = useState("5.00"); // Will be updated when hashrate data loads
  const [priceInitialized, setPriceInitialized] = useState(false); // Track if price has been initialized from hashrate
  const [amount, setAmount] = useState(1);
  const [highlightedButton, setHighlightedButton] = useState<"buy" | "sell" | "inputs" | null>(null);
  const [showHighPriceModal, setShowHighPriceModal] = useState(false);
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [bypassConflictCheck, setBypassConflictCheck] = useState(false);
  const [conflictingOrderQuantity, setConflictingOrderQuantity] = useState<number | null>(null);
  const [pendingOrder, setPendingOrder] = useState<{
    price: number;
    amount: number;
    quantity: number; // Positive for Buy, Negative for Sell
  } | null>(null);

  // Get high price percentage from environment variable (default 60 for 160%)
  const highPricePercentage = Number(process.env.REACT_APP_FUTURES_HIGH_PRICE_PERCENTAGE || "60");
  const maxPriceMultiplier = 1 + highPricePercentage / 100; // Convert percentage to multiplier

  // Set default price from newest hashprice when data loads (if no external price set)
  useEffect(() => {
    if (!externalPrice && !priceInitialized && newestItemPrice && priceStep) {
      // Only update if we haven't initialized yet and no external price is set
      const snappedPrice = Math.round(newestItemPrice / priceStep) * priceStep;
      setPrice(snappedPrice.toFixed(2));
      setPriceInitialized(true);
    }
  }, [newestItemPrice, priceStep, externalPrice, priceInitialized]);

  // Update values when external props change
  useEffect(() => {
    if (externalPrice !== undefined) {
      setPrice(externalPrice);
      setPriceInitialized(true); // Mark as initialized when external price is set
    }
  }, [externalPrice]);

  useEffect(() => {
    if (externalAmount !== undefined) {
      setAmount(externalAmount);
    }
  }, [externalAmount]);

  // Highlight button when position is closed and values are substituted
  useEffect(() => {
    if (
      externalPrice !== undefined &&
      externalAmount !== undefined &&
      highlightTrigger !== undefined &&
      highlightMode !== undefined &&
      highlightTrigger > 0
    ) {
      // Reset highlight first to ensure visual feedback
      setHighlightedButton(null);

      const mode = highlightMode === "buttons" ? (externalIsBuy ? "buy" : "sell") : "inputs";
      // Set highlight in next tick to ensure visual change
      const highlightTimeout = setTimeout(() => {
        setHighlightedButton(mode);
      }, 10);

      // Clear highlight after 3 seconds
      const clearTimeoutId = setTimeout(() => {
        setHighlightedButton(null);
      }, 3000);

      return () => {
        clearTimeout(highlightTimeout);
        clearTimeout(clearTimeoutId);
      };
    }
  }, [highlightMode, externalIsBuy, externalPrice, externalAmount, highlightTrigger]);

  // Show loading state while minimumPriceIncrement is being fetched
  if (contractSpecsQuery.isLoading || !priceStep || isMarketPriceLoading || !newestItemPrice) {
    return (
      <PlaceOrderContainer>
        <h3>Place Order</h3>
        <div style={{ textAlign: "center", padding: "2rem", color: "#6b7280" }}>
          <Spinner fontSize="0.3em" />
          <p style={{ marginTop: "1rem", margin: 0 }}>Loading contract specifications...</p>
        </div>
      </PlaceOrderContainer>
    );
  }

  // Helper functions for price adjustment
  const snapToStep = (value: number): number => {
    return Math.round(value / priceStep) * priceStep;
  };

  const incrementPrice = () => {
    const currentPrice = parseFloat(price) || 0;
    const newPrice = snapToStep(currentPrice + priceStep);
    setPrice(newPrice.toFixed(2));
  };

  const decrementPrice = () => {
    const currentPrice = parseFloat(price) || 0;
    const newPrice = snapToStep(Math.max(0.01, currentPrice - priceStep));
    setPrice(newPrice.toFixed(2));
  };

  const handleBuy = async () => {
    if (!externalDeliveryDate) {
      alert("Please select a price from the order book to set delivery date");
      return;
    }

    // Validate balance for buy orders using getMinMarginForPositionManual
    const currentPrice = parseFloat(price);
    const priceInWei = BigInt(Math.round(currentPrice * 1e6));
    const totalBalance = balanceQuery.data ?? 0n;
    const lockedBalance = minMargin ?? 0n;
    const availableBalance = totalBalance - lockedBalance;

    if (!latestPrice) {
      alert("Unable to fetch market price. Please try again.");
      return;
    }

    const requiredMargin = getMinMarginForPositionManual(
      priceInWei,
      amount, // Positive quantity for Buy
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
      return;
    }

    // Check for conflicting orders (opposite action, same price, same delivery date)
    if (participantData?.orders) {
      const priceInWei = BigInt(Math.round(currentPrice * 1e6));
      const deliveryDateValue = BigInt(externalDeliveryDate);
      const conflictingOrder = participantData.orders.find(
        (order) =>
          order.isActive &&
          !order.isBuy && // Opposite action (Sell)
          order.pricePerDay === priceInWei &&
          order.deliveryAt === deliveryDateValue,
      );

      if (conflictingOrder) {
        // Note: ParticipantOrder doesn't expose quantity, so we can't show it
        setConflictingOrderQuantity(null);
        setPendingOrder({
          price: currentPrice,
          amount: amount,
          quantity: amount, // Positive for Buy
        });
        setShowConflictModal(true);
        return;
      }
    }

    // Check if price exceeds the configured percentage of newest item price
    const maxAllowedPrice = newestItemPrice * maxPriceMultiplier;

    if (currentPrice > maxAllowedPrice) {
      setPendingOrder({
        price: currentPrice,
        amount: amount,
        quantity: amount, // Positive for Buy
      });
      setShowHighPriceModal(true);
      return;
    }

    openOrderForm(currentPrice, amount, amount); // Positive quantity for Buy
  };

  const handleSell = async () => {
    if (!externalDeliveryDate) {
      alert("Please select a price from the order book to set delivery date");
      return;
    }

    // Validate balance for sell orders using getMinMarginForPositionManual
    const currentPrice = parseFloat(price);
    const priceInWei = BigInt(Math.round(currentPrice * 1e6));
    const totalBalance = balanceQuery.data ?? 0n;
    const lockedBalance = minMargin ?? 0n;
    const availableBalance = totalBalance - lockedBalance;

    if (!latestPrice) {
      alert("Unable to fetch market price. Please try again.");
      return;
    }

    const requiredMargin = getMinMarginForPositionManual(
      priceInWei,
      -amount, // Negative quantity for Sell
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
      return;
    }

    // Check for conflicting orders (opposite action, same price, same delivery date)
    if (participantData?.orders) {
      const priceInWei = BigInt(Math.round(currentPrice * 1e6));
      const deliveryDateValue = BigInt(externalDeliveryDate);
      const conflictingOrder = participantData.orders.find(
        (order) =>
          order.isActive &&
          order.isBuy && // Opposite action (Buy)
          order.pricePerDay === priceInWei &&
          order.deliveryAt === deliveryDateValue,
      );

      if (conflictingOrder) {
        // Note: ParticipantOrder doesn't expose quantity, so we can't show it
        setConflictingOrderQuantity(null);
        setPendingOrder({
          price: currentPrice,
          amount: amount,
          quantity: -amount, // Negative for Sell
        });
        setShowConflictModal(true);
        return;
      }
    }

    // Check if price exceeds the configured percentage of newest item price
    const maxAllowedPrice = newestItemPrice * maxPriceMultiplier;

    if (currentPrice > maxAllowedPrice) {
      setPendingOrder({
        price: currentPrice,
        amount: amount,
        quantity: -amount, // Negative for Sell
      });
      setShowHighPriceModal(true);
      return;
    }

    openOrderForm(currentPrice, amount, -amount); // Negative quantity for Sell
  };

  const openOrderForm = (orderPrice: number, orderAmount: number, quantity: number) => {
    setPendingOrder({
      price: orderPrice,
      amount: orderAmount,
      quantity: quantity,
    });
    setShowOrderForm(true);
  };

  const handleConfirmHighPrice = () => {
    if (pendingOrder) {
      setShowHighPriceModal(false);
      setShowOrderForm(true);
    }
  };

  const handleCancelHighPrice = () => {
    setShowHighPriceModal(false);
    setPendingOrder(null);
    setBypassConflictCheck(false);
  };

  const handleConfirmConflict = () => {
    if (pendingOrder) {
      setShowConflictModal(false);
      setBypassConflictCheck(true);
      setShowOrderForm(true);
    }
  };

  const handleCancelConflict = () => {
    setShowConflictModal(false);
    setPendingOrder(null);
    setConflictingOrderQuantity(null);
    setBypassConflictCheck(false);
  };

  return (
    <>
      <PlaceOrderContainer>
        <h3>Place Order</h3>

        <MainSection>
          <InputSection>
            <InputGroup $isHighlighted={highlightedButton !== null}>
              <label>Price per day (USDC)</label>
              <PriceInputContainer $isHighlighted={highlightedButton !== null}>
                <PriceButton
                  onClick={decrementPrice}
                  disabled={showOrderForm}
                  $isHighlighted={highlightedButton !== null}
                >
                  −
                </PriceButton>
                <input
                  type="text"
                  value={price}
                  onChange={(e) => {
                    setPrice(e.target.value);
                  }}
                  onBeforeInput={handleNumericDecimalInput}
                  step={priceStep}
                  min="0.01"
                  inputMode={"numeric"}
                  style={{ minWidth: "70px" }}
                />
                <PriceButton
                  onClick={incrementPrice}
                  disabled={showOrderForm}
                  $isHighlighted={highlightedButton !== null}
                >
                  +
                </PriceButton>
              </PriceInputContainer>
            </InputGroup>

            <InputGroup $isHighlighted={highlightedButton !== null}>
              <label>Quantity</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value.replace("-", "")))}
                min="1"
                max="50"
              />
            </InputGroup>
          </InputSection>

          <ButtonSection>
            <BuyButton onClick={handleBuy} disabled={showOrderForm} $isHighlighted={highlightedButton === "buy"}>
              Bid
            </BuyButton>
            <SellButton onClick={handleSell} disabled={showOrderForm} $isHighlighted={highlightedButton === "sell"}>
              Ask
            </SellButton>
          </ButtonSection>
        </MainSection>
      </PlaceOrderContainer>

      <ModalItem open={showHighPriceModal} setOpen={setShowHighPriceModal}>
        <HighPriceConfirmationModal
          pendingOrder={pendingOrder}
          newestItemPrice={newestItemPrice}
          highPricePercentage={highPricePercentage}
          contractSpecsQuery={contractSpecsQuery}
          onConfirm={handleConfirmHighPrice}
          onCancel={handleCancelHighPrice}
        />
      </ModalItem>

      <ModalItem open={showConflictModal} setOpen={setShowConflictModal}>
        <ConflictingOrderModal
          pendingOrder={pendingOrder}
          conflictingOrderQuantity={conflictingOrderQuantity}
          externalDeliveryDate={externalDeliveryDate}
          onConfirm={handleConfirmConflict}
          onCancel={handleCancelConflict}
        />
      </ModalItem>

      {showOrderForm && pendingOrder && externalDeliveryDate && (
        <ModalItem
          open={showOrderForm}
          setOpen={(open) => {
            setShowOrderForm(open);
            if (!open) {
              setPendingOrder(null);
            }
          }}
        >
          <PlaceOrderForm
            price={BigInt(Math.round(pendingOrder.price * 1e6))}
            deliveryDate={BigInt(externalDeliveryDate)}
            quantity={pendingOrder.quantity}
            participantData={participantData}
            latestPrice={latestPrice}
            onOrderPlaced={onOrderPlaced}
            bypassConflictCheck={bypassConflictCheck}
            closeForm={() => {
              setShowOrderForm(false);
              setPendingOrder(null);
              setConflictingOrderQuantity(null);
              setBypassConflictCheck(false);
            }}
          />
        </ModalItem>
      )}
    </>
  );
};

const ConflictingOrderModal = ({
  pendingOrder,
  conflictingOrderQuantity,
  externalDeliveryDate,
  onConfirm,
  onCancel,
}: {
  pendingOrder: { price: number; amount: number; quantity: number } | null;
  conflictingOrderQuantity: number | null;
  externalDeliveryDate?: number;
  onConfirm: () => void;
  onCancel: () => void;
}) => {
  if (!pendingOrder) return null;

  const isBuy = pendingOrder.quantity > 0;
  const oppositeAction = isBuy ? "Ask" : "Bid";
  const deliveryDateFormatted = externalDeliveryDate ? new Date(externalDeliveryDate * 1000).toLocaleString() : "N/A";

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-white mb-6">Conflicting Order Detected</h2>

      <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-4">
        <p className="text-gray-300 text-sm mb-3">
          You already have an active <strong className="text-white">{oppositeAction}</strong> order at the same price
          and delivery date.
        </p>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-300">Price:</span>
            <span className="text-white font-medium">{pendingOrder.price.toFixed(2)} USDC</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Delivery Date:</span>
            <span className="text-white font-medium">{deliveryDateFormatted}</span>
          </div>
        </div>
      </div>

      <div className="bg-white-900/20 border border-white-500/30 rounded-lg p-4">
        <p className="text-white-300 text-sm leading-relaxed">
          <strong>Important:</strong> Your order of <strong>{pendingOrder.amount} units</strong> will be placed as
          specified. However, it will be matched against your existing {oppositeAction} order and offset orders will be
          closed.
        </p>
      </div>

      <div className="flex gap-3 justify-end">
        <SecondaryButton onClick={onCancel}>Cancel</SecondaryButton>
        <PrimaryButton onClick={onConfirm}>Proceed with Order</PrimaryButton>
      </div>
    </div>
  );
};

const HighPriceConfirmationModal = ({
  pendingOrder,
  newestItemPrice,
  highPricePercentage,
  contractSpecsQuery,
  onConfirm,
  onCancel,
}: {
  pendingOrder: { price: number; amount: number; quantity: number } | null;
  newestItemPrice: number;
  highPricePercentage: number;
  contractSpecsQuery: UseQueryResult<GetResponse<FuturesContractSpecs>, Error>;
  onConfirm: () => void;
  onCancel: () => void;
}) => {
  if (!pendingOrder) return null;

  const percentageOver = ((pendingOrder.price / newestItemPrice) * 100).toFixed(1);
  const isBuy = pendingOrder.quantity > 0;
  const deliveryDurationDays = contractSpecsQuery.data?.data?.deliveryDurationDays ?? 7;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-white mb-6">High Price Warning</h2>

      <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
        <div className="flex items-center mb-3">
          <span className="text-yellow-400 text-2xl mr-3">⚠️</span>
          <h3 className="text-lg font-semibold text-yellow-400">Price Exceeds Market</h3>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-300">Your Price:</span>
            <span className="text-white font-medium">{pendingOrder.price.toFixed(2)} USDC</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-300">Market Price:</span>
            <span className="text-white font-medium">{newestItemPrice.toFixed(2)} USDC</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-300">Percentage of Market:</span>
            <span className="text-red-400 font-medium">{percentageOver}%</span>
          </div>
        </div>
      </div>

      <div className="rounded-lg p-4">
        <h4 className="text-white font-semibold mb-2">Order Details:</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-300">Type:</span>
            <span className="text-white">{isBuy ? "Bid" : "Ask"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Amount:</span>
            <span className="text-white">{pendingOrder.amount} units</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Total Value:</span>
            <span className="text-white">
              {(pendingOrder.price * pendingOrder.amount * deliveryDurationDays).toFixed(2)} USDC
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Expected Hashrate:</span>
            <span className="text-white">{pendingOrder.amount * 100} Th/s</span>
          </div>
        </div>
      </div>

      <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
        <p className="text-red-300 text-sm">
          <strong>Warning:</strong> This price is significantly above the current market rate. You may experience
          difficulty finding a counterparty or may face higher slippage.
        </p>
      </div>

      <div className="flex gap-3 justify-end">
        <SecondaryButton onClick={onCancel}>Cancel</SecondaryButton>
        <PrimaryButton onClick={onConfirm} className="bg-red-600 hover:bg-red-700">
          Proceed Anyway
        </PrimaryButton>
      </div>
    </div>
  );
};

const PlaceOrderContainer = styled(SmallWidget)`
  width: 100%;
  padding: 1.5rem;
  margin-bottom: 0px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  
  h3 {
    margin: 0;
    font-size: 1.3rem;
    font-weight: 600;
    color: #fff;
  }
`;

const MainSection = styled("div")`
  display: flex;
  width: 100%;
  flex-direction: row;
  gap: 1.5rem;
  align-items: center;
  
  @media (max-width: 1400px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const InputSection = styled("div")`
  display: flex;
  flex-direction: row;
  gap: 1rem;
  flex: 1;
  
  @media (max-width: 640px) {
    flex-direction: column;
  }
`;

const InputGroup = styled("div")<{ $isHighlighted?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
  
  label {
    font-size: 0.875rem;
    font-weight: 500;
    color: #a7a9b6;
  }
  
  input {
    padding: 0.75rem;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 6px;
    color: #fff;
    font-size: 1rem;
    transition: border-color 0.2s ease;
    width: 100%;
    animation: ${(props) => getPulseAnimation(props.$isHighlighted)};
    background: ${(props) => (props.$isHighlighted ? undefined : "rgba(255, 255, 255, 0.05)")};
    
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

const PriceInputContainer = styled("div")<{ $isHighlighted?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  input {
    flex: 1;
    border-radius: 0;
    border-left: none;
    border-right: none;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    animation: ${(props) => getPulseAnimation(props.$isHighlighted)};
    background: ${(props) => (props.$isHighlighted ? undefined : "rgba(255, 255, 255, 0.05)")};
    
    &:focus {
      border-left: 1px solid #509EBA;
      border-right: 1px solid #509EBA;
    }
  }
`;

const PriceButton = styled("button")<{ $isHighlighted?: boolean }>`
  padding: 0.75rem 1rem;
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 44px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${(props) => getPulseAnimation(props.$isHighlighted)};
  background: ${(props) => (props.$isHighlighted ? undefined : "rgba(255, 255, 255, 0.1)")};
  
  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
  }
  
  &:active:not(:disabled) {
    background: rgba(255, 255, 255, 0.2);
  }
  
  &:disabled {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.1);
    cursor: not-allowed;
    opacity: 0.5;
  }
  
  &:first-child {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }
  
  &:last-child {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }
`;

const ButtonSection = styled("div")`
  gap: 0.75rem;
  flex-shrink: 0;
  align-self: end;
  display: flex;
  flex-direction: row;
  
  @media (max-width: 1400px) {
    flex-direction: row;
    justify-content: center;
    align-self: stretch;
    width: 100%;
    
    button {
      flex: 1;
    }
  }
`;

const BuyButton = styled("button")<{ $isHighlighted?: boolean }>`
  padding: 0.875rem 1rem;
  background: #22c55e;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.1s ease;
  min-width: 120px;
  animation: ${(props) => (props.$isHighlighted ? css`${pulseYellow} 1.5s ease-in-out infinite` : "none")};
  
  &:hover:not(:disabled) {
    background: #16a34a;
    transform: translateY(-1px);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  &:disabled {
    background: #6b7280;
    cursor: not-allowed;
    opacity: 0.6;
    animation: none;
  }
`;

const SellButton = styled("button")<{ $isHighlighted?: boolean }>`
  padding: 0.875rem 1rem;
  background: #ef4444;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.1s ease;
  min-width: 120px;
  animation: ${(props) => (props.$isHighlighted ? css`${pulseYellow} 1.5s ease-in-out infinite` : "none")};
  
  &:hover:not(:disabled) {
    background: #dc2626;
    transform: translateY(-1px);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  &:disabled {
    background: #6b7280;
    cursor: not-allowed;
    opacity: 0.6;
    animation: none;
  }
`;
