import type { FC, ReactNode } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArchive } from "@fortawesome/free-solid-svg-icons/faArchive";
import { faCircleXmark } from "@fortawesome/free-solid-svg-icons/faCircleXmark";
import { faPencil } from "@fortawesome/free-solid-svg-icons/faPencil";
import { faRotateBack } from "@fortawesome/free-solid-svg-icons/faRotateBack";
import { faSackDollar } from "@fortawesome/free-solid-svg-icons/faSackDollar";
import styled from "@mui/material/styles/styled";
import { PrimaryButton } from "./Forms/FormButtons/Buttons.styled";

export const CancelButton: FC<BaseProps> = (props) => (
  <ActionButton {...props} text="Cancel" icon={<FontAwesomeIcon icon={faCircleXmark} />} />
);
//
export const ClaimLmrButton: FC<BaseProps> = (props) => (
  <ActionButton {...props} text="Claim" icon={<FontAwesomeIcon icon={faSackDollar} />} />
);

export const EditButton: FC<BaseProps> = (props) => (
  <ActionButton {...props} text="Edit" icon={<FontAwesomeIcon icon={faPencil} />} />
);

export const ArchiveButton: FC<BaseProps> = (props) => (
  <ActionButton {...props} text="Archive" icon={<FontAwesomeIcon icon={faArchive} />} />
);

export const UnarchiveButton: FC<BaseProps> = (props) => (
  <ActionButton {...props} text="Unarchive" icon={<FontAwesomeIcon icon={faRotateBack} />} />
);

interface Props extends BaseProps {
  icon: ReactNode;
  text: string;
}

interface BaseProps {
  onClick: () => void;
  disabled?: boolean;
}

export const ActionButton: FC<Props> = ({ onClick, text, icon, disabled }) => {
  return (
    <ActionButtonWrapper>
      <PrimaryButton type="button" onClick={onClick} disabled={disabled} $hoverText={text}>
        {icon}
      </PrimaryButton>
    </ActionButtonWrapper>
  );
};

export const ActionButtonWrapper = styled("div")`
  width: 30px;
  button {
    border-radius: 50px;
    width: 30px;
    height: 30px;
    border: none;
    background: #e2edfb;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #064152;
    &:disabled {
      color: rgb(111, 111, 111);
    }
  }
  p {
    font-family: Inter, sans-serif;
    font-size: 0.65rem;
    text-align: center;
    margin-top: 5px;
  }
`;
