import type React from "react";
import { ActionButtonWrapper } from "./Buttons.styled";
import { faPencil } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface EditButtonProps {
  onEdit: () => void;
}

export const EditButton: React.FC<EditButtonProps> = ({ onEdit }) => {
  return (
    <ActionButtonWrapper>
      <button type="button" onClick={() => onEdit()}>
        <FontAwesomeIcon icon={faPencil} color="rgb(6 65 82)" />
      </button>
      <p className="text-white">Edit</p>
    </ActionButtonWrapper>
  );
};
