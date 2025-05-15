import type React from "react";
import { ActionButtonWrapper } from "./Buttons.styled";
import { faSackDollar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface ClaimLmrButtonProps {
  onClick: () => void;
  disabled: boolean;
}

export const ClaimLmrButton: React.FC<ClaimLmrButtonProps> = ({ onClick, disabled }) => {
  return (
    <ActionButtonWrapper>
      <button type="button" onClick={onClick} disabled={disabled}>
        <FontAwesomeIcon icon={faSackDollar} color="rgb(6 65 82)" />
      </button>
      <p>Claim</p>
    </ActionButtonWrapper>
  );
};
