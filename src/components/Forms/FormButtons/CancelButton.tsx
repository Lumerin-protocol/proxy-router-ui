import type React from "react";
import { Dispatch, SetStateAction } from "react";
import CancelIcon from "../../../images/icons/cancel.png";
import { ActionButtonWrapper } from "./Buttons.styled";

interface CancelButtonProps {
  onCancel: () => void;
}

export const CancelButton: React.FC<CancelButtonProps> = ({ onCancel }) => {
  return (
    <ActionButtonWrapper>
      <button type="button" onClick={onCancel}>
        <img className="cancel" src={CancelIcon} alt="" />
      </button>
      <p className="text-white">Cancel</p>
    </ActionButtonWrapper>
  );
};
