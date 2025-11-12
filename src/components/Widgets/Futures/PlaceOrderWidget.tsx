import styled from "@mui/material/styles/styled";
import { SmallWidget } from "../../Cards/Cards.styled";
import { useState, useEffect } from "react";
import { useHashrateIndexData } from "../../../hooks/data/useHashRateIndexData";
import { Spinner } from "../../Spinner.styled";
import { ModalItem } from "../../Modal";
import { PrimaryButton, SecondaryButton } from "../../Forms/FormButtons/Buttons.styled";
import { PlaceOrderForm } from "../../Forms/PlaceOrderForm";
import type { UseQueryResult } from "@tanstack/react-query";
import type { GetResponse } from "../../../gateway/interfaces";
import type { FuturesContractSpecs } from "../../../hooks/data/useFuturesContractSpecs";
import { useAccount } from "wagmi";
import { useGetFutureBalance } from "../../../hooks/data/useGetFutureBalance";

interface PlaceOrderWidgetProps {
  externalPrice?: string;
  externalAmount?: number;
  externalDeliveryDate?: number;
  externalIsBuy?: boolean;
  highlightTrigger?: number;
  address?: `0x${string}`;
  contractSpecsQuery: UseQueryResult<GetResponse<FuturesContractSpecs>, Error>;
}

export const PlaceOrderWidget = ({
  externalPrice,
  externalAmount,
  externalDeliveryDate,
  externalIsBuy,
  highlightTrigger,
  contractSpecsQuery,
}: PlaceOrderWidgetProps) => {
  const hashrateQuery = useHashrateIndexData();
  const { address } = useAccount();
  const balanceQuery = useGetFutureBalance(address);

  // Calculate price step from contract specs
  const priceStep = contractSpecsQuery.data?.data?.minimumPriceIncrement
    ? Number(contractSpecsQuery.data.data.minimumPriceIncrement) / 1e6
    : null;

  // Get newest item price for validation and default price
  const newestItemPrice =
    hashrateQuery.data && hashrateQuery.data.length > 0 ? Number(hashrateQuery.data[0].priceToken) / 1e6 : null;

  const [price, setPrice] = useState("5.00"); // Will be updated when hashrate data loads
  const [priceInitialized, setPriceInitialized] = useState(false); // Track if price has been initialized from hashrate
  const [amount, setAmount] = useState(1);
  const [highlightedButton, setHighlightedButton] = useState<"buy" | "sell" | null>(null);
  const [showHighPriceModal, setShowHighPriceModal] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
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
      externalIsBuy !== undefined &&
      externalPrice !== undefined &&
      externalAmount !== undefined &&
      highlightTrigger !== undefined &&
      highlightTrigger > 0
    ) {
      // Reset highlight first to ensure visual feedback
      setHighlightedButton(null);

      // Set highlight in next tick to ensure visual change
      const highlightTimeout = setTimeout(() => {
        setHighlightedButton(externalIsBuy ? "buy" : "sell");
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
  }, [externalIsBuy, externalPrice, externalAmount, highlightTrigger]);

  // Show loading state while minimumPriceIncrement is being fetched
  if (contractSpecsQuery.isLoading || !priceStep || hashrateQuery.isLoading || !newestItemPrice) {
    return (
      <PlaceOrderContainer>
        <h3>Place order</h3>
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
    const newPrice = snapToStep(Math.max(0, currentPrice - priceStep));
    setPrice(newPrice.toFixed(2));
  };

  const handlePriceChange = (value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      const snappedValue = snapToStep(numValue);
      setPrice(snappedValue.toFixed(2));
    } else {
      setPrice("1.00");
    }
  };

  const handleBuy = async () => {
    if (!externalDeliveryDate) {
      alert("Please select a price from the order book to set delivery date");
      return;
    }

    // Validate balance for buy orders
    const currentPrice = parseFloat(price);
    const totalOrderValue = BigInt(Math.round(currentPrice * 1e6)) * BigInt(amount);
    const balance = balanceQuery.data ?? 0n;

    if (totalOrderValue > balance) {
      alert("Insufficient funds");
      return;
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

    // Check if price exceeds the configured percentage of newest item price
    const currentPrice = parseFloat(price);
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
  };

  return (
    <>
      <PlaceOrderContainer>
        <h3>Place order</h3>

        <MainSection>
          <InputSection>
            <InputGroup>
              <label>Price, USDC (Step: {priceStep.toFixed(2)})</label>
              <PriceInputContainer>
                <PriceButton onClick={decrementPrice} disabled={showOrderForm}>
                  −
                </PriceButton>
                <input
                  type="text"
                  value={price}
                  placeholder="5.00"
                  onChange={(e) => handlePriceChange(e.target.value)}
                  step={priceStep}
                  min="1"
                  inputMode={"decimal"}
                />
                <PriceButton onClick={incrementPrice} disabled={showOrderForm}>
                  +
                </PriceButton>
              </PriceInputContainer>
            </InputGroup>

            <InputGroup>
              <label>Amount</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                min="1"
                max="50"
              />
            </InputGroup>
          </InputSection>

          <ButtonSection>
            <BuyButton onClick={handleBuy} disabled={showOrderForm} $isHighlighted={highlightedButton === "buy"}>
              Buy
            </BuyButton>
            <SellButton onClick={handleSell} disabled={showOrderForm} $isHighlighted={highlightedButton === "sell"}>
              Sell
            </SellButton>
          </ButtonSection>
        </MainSection>
      </PlaceOrderContainer>

      <ModalItem open={showHighPriceModal} setOpen={setShowHighPriceModal}>
        <HighPriceConfirmationModal
          pendingOrder={pendingOrder}
          newestItemPrice={newestItemPrice}
          highPricePercentage={highPricePercentage}
          onConfirm={handleConfirmHighPrice}
          onCancel={handleCancelHighPrice}
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
            closeForm={() => {
              setShowOrderForm(false);
              setPendingOrder(null);
            }}
          />
        </ModalItem>
      )}
    </>
  );
};

const HighPriceConfirmationModal = ({
  pendingOrder,
  newestItemPrice,
  highPricePercentage,
  onConfirm,
  onCancel,
}: {
  pendingOrder: { price: number; amount: number; quantity: number } | null;
  newestItemPrice: number;
  highPricePercentage: number;
  onConfirm: () => void;
  onCancel: () => void;
}) => {
  if (!pendingOrder) return null;

  const percentageOver = ((pendingOrder.price / newestItemPrice) * 100).toFixed(1);
  const isBuy = pendingOrder.quantity > 0;

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
            <span className="text-white font-medium">${pendingOrder.price.toFixed(2)}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-300">Market Price:</span>
            <span className="text-white font-medium">${newestItemPrice.toFixed(2)}</span>
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
            <span className="text-white">{isBuy ? "Buy" : "Sell"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Amount:</span>
            <span className="text-white">{pendingOrder.amount} units</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Total Value:</span>
            <span className="text-white">${(pendingOrder.price * pendingOrder.amount).toFixed(2)}</span>
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
  display: flex;
  flex-direction: column;
  gap: 1rem;
  
  h3 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: #fff;
  }
`;

const MainSection = styled("div")`
  display: flex;
  flex-direction: row;
  gap: 1.5rem;
  align-items: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const InputSection = styled("div")`
  display: flex;
  flex-direction: row;
  gap: 1rem;
  flex: 1;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const InputGroup = styled("div")`
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

const PriceInputContainer = styled("div")`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  input {
    flex: 1;
    border-radius: 0;
    border-left: none;
    border-right: none;
    
    &:focus {
      border-left: 1px solid #509EBA;
      border-right: 1px solid #509EBA;
    }
  }
`;

const PriceButton = styled("button")`
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.1);
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
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex-shrink: 0;
  
  @media (max-width: 768px) {
    flex-direction: row;
    justify-content: center;
  }
`;

const BuyButton = styled("button")<{ $isHighlighted?: boolean }>`
  padding: 0.875rem 1rem;
  background: ${(props) => (props.$isHighlighted ? "#16a34a" : "#22c55e")};
  color: #fff;
  border: ${(props) => (props.$isHighlighted ? "2px solid #10b981" : "none")};
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.1s ease, box-shadow 0.2s ease;
  min-width: 120px;
  box-shadow: ${(props) => (props.$isHighlighted ? "0 0 12px rgba(34, 197, 94, 0.6)" : "none")};
  
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
  }
`;

const SellButton = styled("button")<{ $isHighlighted?: boolean }>`
  padding: 0.875rem 1rem;
  background: ${(props) => (props.$isHighlighted ? "#dc2626" : "#ef4444")};
  color: #fff;
  border: ${(props) => (props.$isHighlighted ? "2px solid #f87171" : "none")};
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.1s ease, box-shadow 0.2s ease;
  min-width: 120px;
  box-shadow: ${(props) => (props.$isHighlighted ? "0 0 12px rgba(239, 68, 68, 0.6)" : "none")};
  
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
  }
`;
