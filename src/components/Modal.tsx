import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import Modal from "@mui/material/Modal";
import { ModalCard } from "./Modal.styled";
import type { FC, ReactNode } from "react";
import { css } from "@mui/material/styles";

interface ModalProps {
  open: boolean;
  setOpen: (isOpen: boolean) => void;
  content?: ReactNode;
  children?: ReactNode;
}

export const ModalItem: FC<ModalProps> = ({ open, setOpen, content, children }) => {
  return (
    <Modal
      open={open}
      onClose={() => setOpen(false)}
      css={css`
        position: absolute;
        overflow: scroll;
      `}
    >
      <ModalCard>
        <IconButton className="close" sx={{ color: "white" }} onClick={() => setOpen(false)}>
          <CloseIcon />
        </IconButton>
        {children || content}
      </ModalCard>
    </Modal>
  );
};
