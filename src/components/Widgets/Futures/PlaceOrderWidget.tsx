import styled from "@mui/material/styles/styled";
import { SmallWidget } from "../../Cards/Cards.styled";
import { useState } from "react";

export const PlaceOrderWidget = () => {
  const [price, setPrice] = useState("5.00");
  const [amount, setAmount] = useState("3");

  const handleBuy = () => {
    console.log("Buy order:", { price, amount });
    // TODO: Implement buy order logic
  };

  const handleSell = () => {
    console.log("Sell order:", { price, amount });
    // TODO: Implement sell order logic
  };

  return (
    <PlaceOrderContainer>
      <h3>Place order</h3>

      <InputSection>
        <InputGroup>
          <label>Price, USDC</label>
          <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} step="0.01" min="0" />
        </InputGroup>

        <InputGroup>
          <label>Amount</label>
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} min="0" />
        </InputGroup>
      </InputSection>

      <ButtonSection>
        <BuyButton onClick={handleBuy}>Buy / Long</BuyButton>
        <SellButton onClick={handleSell}>Sell / Short</SellButton>
      </ButtonSection>
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

const InputSection = styled("div")`
  display: flex;
  flex-direction: column;
  gap: 1rem;
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

const ButtonSection = styled("div")`
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;
`;

const BuyButton = styled("button")`
  flex: 1;
  padding: 0.875rem 1rem;
  background: #22c55e;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.1s ease;
  
  &:hover {
    background: #16a34a;
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const SellButton = styled("button")`
  flex: 1;
  padding: 0.875rem 1rem;
  background: #ef4444;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.1s ease;
  
  &:hover {
    background: #dc2626;
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;
