import { useState, useCallback } from "react";
import styled from "@mui/material/styles/styled";
import { ModalItem } from "../../Modal";
import { PrimaryButton } from "../../Forms/FormButtons/Buttons.styled";

const CLOSE_POSITION_MODAL_KEY = "futures_close_position_modal_dismissed";

interface ClosePositionData {
  price: string;
  amount: number;
  isBuy: boolean;
}

interface ClosePositionModalProps {
  isOpen: boolean;
  pendingClosePosition: ClosePositionData | null;
  onConfirm: () => void;
  onCancel: () => void;
  onDoNotShowAgainChange: (checked: boolean) => void;
  doNotShowAgain: boolean;
}

// Hook to manage close position modal state and localStorage
export const useClosePositionModal = (onProceedWithClose: (price: string, amount: number, isBuy: boolean) => void) => {
  const [showModal, setShowModal] = useState(false);
  const [doNotShowAgain, setDoNotShowAgain] = useState(false);
  const [pendingClosePosition, setPendingClosePosition] = useState<ClosePositionData | null>(null);

  const handleClosePosition = useCallback(
    (price: string, amount: number, isBuy: boolean) => {
      // Check if user has dismissed the modal before
      const isDismissed = localStorage.getItem(CLOSE_POSITION_MODAL_KEY) === "true";

      if (isDismissed) {
        // Skip modal, proceed directly with highlighting
        onProceedWithClose(price, amount, isBuy);
      } else {
        // Store pending data and show modal
        setPendingClosePosition({ price, amount, isBuy });
        setShowModal(true);
      }
    },
    [onProceedWithClose],
  );

  const handleConfirm = useCallback(() => {
    // Save preference if checkbox is checked
    if (doNotShowAgain) {
      localStorage.setItem(CLOSE_POSITION_MODAL_KEY, "true");
    }

    // Close modal
    setShowModal(false);

    // Proceed with highlighting if we have pending data
    if (pendingClosePosition) {
      onProceedWithClose(pendingClosePosition.price, pendingClosePosition.amount, pendingClosePosition.isBuy);
      setPendingClosePosition(null);
    }

    // Reset checkbox state
    setDoNotShowAgain(false);
  }, [doNotShowAgain, pendingClosePosition, onProceedWithClose]);

  const handleCancel = useCallback(() => {
    setShowModal(false);
    setPendingClosePosition(null);
    setDoNotShowAgain(false);
  }, []);

  return {
    showModal,
    setShowModal,
    doNotShowAgain,
    setDoNotShowAgain,
    pendingClosePosition,
    handleClosePosition,
    handleConfirm,
    handleCancel,
  };
};

export const ClosePositionModal = ({
  isOpen,
  pendingClosePosition,
  onConfirm,
  onCancel,
  onDoNotShowAgainChange,
  doNotShowAgain,
}: ClosePositionModalProps) => {
  return (
    <ModalItem open={isOpen} setOpen={(open) => !open && onCancel()}>
      <ClosePositionModalContent>
        <ModalTitle>Close Position</ModalTitle>

        <ModalMessage>
          To close your position, you create an opposing order to your original order.
          {pendingClosePosition && (
            <>
              {" "}
              We have prefilled the Place Order widget with <strong>{pendingClosePosition.amount}</strong> contract(s)
              at the current <strong>market price ({pendingClosePosition.price} USDC)</strong>. Adjust if required and
              then click <strong>{pendingClosePosition.isBuy ? "Buy" : "Sell"}</strong> to create the order.
            </>
          )}
        </ModalMessage>

        <ModalNote>When matched with a counterparty, your position will be closed.</ModalNote>

        <CheckboxContainer>
          <input
            type="checkbox"
            id="doNotShowAgain"
            checked={doNotShowAgain}
            onChange={(e) => onDoNotShowAgainChange(e.target.checked)}
          />
          <label htmlFor="doNotShowAgain">Do not show again</label>
        </CheckboxContainer>

        <ModalButtons>
          {/* <CancelButton onClick={onCancel}>
            Cancel
          </CancelButton> */}
          <PrimaryButton onClick={onConfirm}>Okay</PrimaryButton>
        </ModalButtons>
      </ClosePositionModalContent>
    </ModalItem>
  );
};

// Styled Components
const ClosePositionModalContent = styled("div")`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  max-width: 450px;
`;

const ModalTitle = styled("h2")`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #fff;
`;

const ModalMessage = styled("p")`
  margin: 0;
  font-size: 1rem;
  color: #d1d5db;
  line-height: 1.6;

  strong {
    color: #fff;
    font-weight: 600;
  }
`;

const ModalNote = styled("p")`
  margin: 0;
  font-size: 0.875rem;
  color: #9ca3af;
  font-style: italic;
`;

const CheckboxContainer = styled("div")`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;

  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
    accent-color: #509EBA;
  }

  label {
    font-size: 0.875rem;
    color: #d1d5db;
    cursor: pointer;
    user-select: none;
  }
`;

const ModalButtons = styled("div")`
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 0.5rem;
`;

const CancelButton = styled("button")`
  padding: 0.75rem 1.25rem;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
  }
`;
