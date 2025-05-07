import type React from "react";
import { Dispatch, SetStateAction } from "react";
import EditIcon from "../../../images/icons/edit.png";
import { ActionButtonWrapper } from "./Buttons.styled";

interface EditButtonProps {
  onEdit: () => void;
}

export const EditButton: React.FC<EditButtonProps> = ({ onEdit }) => {
  return (
    <ActionButtonWrapper>
      <button type="button" onClick={() => onEdit()}>
        <img src={EditIcon} alt="" />
      </button>
      <p className="text-white">Edit</p>
    </ActionButtonWrapper>
  );
};
