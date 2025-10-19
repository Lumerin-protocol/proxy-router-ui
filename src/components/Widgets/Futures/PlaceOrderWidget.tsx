import styled from "@mui/material/styles/styled";
import { SmallWidget } from "../../Cards/Cards.styled";
import { useState, useEffect } from "react";
import { useCreateOrder } from "../../../hooks/data/useCreateOrder";
import { useFuturesContractSpecs } from "../../../hooks/data/useFuturesContractSpecs";

interface PlaceOrderWidgetProps {
  externalPrice?: string;
  externalAmount?: number;
  externalDeliveryDate?: number;
}

export const PlaceOrderWidget = ({ externalPrice, externalAmount, externalDeliveryDate }: PlaceOrderWidgetProps) => {
  const [price, setPrice] = useState("5.00");
  const [amount, setAmount] = useState(1);

  const { createOrderAsync, isPending, isError, error, hash } = useCreateOrder();
  const contractSpecsQuery = useFuturesContractSpecs({ refetch: true });

  // Calculate price step from contract specs
  const priceStep = contractSpecsQuery.data?.data?.priceLadderStep
    ? Number(contractSpecsQuery.data.data.priceLadderStep) / 1e6
    : 0.05; // Default fallback

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
      setPrice(value);
    }
  };

  // Update values when external props change
  useEffect(() => {
    if (externalPrice !== undefined) {
      setPrice(externalPrice);
    }
  }, [externalPrice]);

  useEffect(() => {
    if (externalAmount !== undefined) {
      setAmount(externalAmount);
    }
  }, [externalAmount]);

  const handleBuy = async () => {
    if (!externalDeliveryDate) {
      alert("Please select a price from the order book to set delivery date");
      return;
    }

    try {
      const priceInWei = BigInt(Math.floor(parseFloat(price) * 1e6));
      const deliveryTimestamp = BigInt(externalDeliveryDate);

      await createOrderAsync({
        price: priceInWei,
        deliveryDate: deliveryTimestamp,
        quantity: amount,
        isBuy: true,
      });

      console.log("Buy order created successfully");
    } catch (err) {
      console.error("Failed to create buy order:", err);
    }
  };

  const handleSell = async () => {
    if (!externalDeliveryDate) {
      alert("Please select a price from the order book to set delivery date");
      return;
    }

    try {
      const priceInWei = BigInt(Math.floor(parseFloat(price) * 1e6));
      const deliveryTimestamp = BigInt(externalDeliveryDate);

      await createOrderAsync({
        price: priceInWei,
        deliveryDate: deliveryTimestamp,
        quantity: amount,
        isBuy: false,
      });

      console.log("Sell order created successfully");
    } catch (err) {
      console.error("Failed to create sell order:", err);
    }
  };

  return (
    <PlaceOrderContainer>
      <h3>Place order</h3>

      <MainSection>
        <InputSection>
          <InputGroup>
            <label>Price, USDC (Step: {priceStep.toFixed(2)})</label>
            <PriceInputContainer>
              <PriceButton onClick={decrementPrice} disabled={isPending}>
                −
              </PriceButton>
              <input
                type="number"
                value={price}
                onChange={(e) => handlePriceChange(e.target.value)}
                step={priceStep}
                min="0"
              />
              <PriceButton onClick={incrementPrice} disabled={isPending}>
                +
              </PriceButton>
            </PriceInputContainer>
          </InputGroup>

          <InputGroup>
            <label>Amount</label>
            <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} min="1" />
          </InputGroup>
        </InputSection>

        <ButtonSection>
          <BuyButton onClick={handleBuy} disabled={isPending}>
            {isPending ? "Creating..." : "Buy / Long"}
          </BuyButton>
          <SellButton onClick={handleSell} disabled={isPending}>
            {isPending ? "Creating..." : "Sell / Short"}
          </SellButton>
        </ButtonSection>

        {isError && error && <ErrorMessage>Error: {error.message || "Failed to create order"}</ErrorMessage>}
      </MainSection>
      {hash && <SuccessMessage>Order created successfully! Transaction: {hash}</SuccessMessage>}
    </PlaceOrderContainer>
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

const BuyButton = styled("button")`
  padding: 0.875rem 1rem;
  background: #22c55e;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.1s ease;
  min-width: 120px;
  
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

const SellButton = styled("button")`
  padding: 0.875rem 1rem;
  background: #ef4444;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.1s ease;
  min-width: 120px;
  
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

const ErrorMessage = styled("div")`
  padding: 0.75rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 6px;
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 1rem;
`;

const SuccessMessage = styled("div")`
  padding: 0.75rem;
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 6px;
  color: #22c55e;
  font-size: 0.875rem;
  margin-top: 1rem;
  word-break: break-all;
`;
