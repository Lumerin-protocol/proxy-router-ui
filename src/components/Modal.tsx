import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import Modal from "@mui/material/Modal";
import { ModalCard } from "./Modal.styled";

interface ModalProps {
  open: boolean;
  setOpen: (isOpen: boolean) => void;
  content?: React.ReactNode;
  children?: React.ReactNode;
}

export const ModalItem: React.FC<ModalProps> = ({ open, setOpen, content, children }) => {
  return (
    <Modal open={open} onClose={() => setOpen}>
      <ModalCard>
        <IconButton className="close" sx={{ color: "white" }} onClick={() => setOpen(false)}>
          <CloseIcon />
        </IconButton>
        {children || content}
      </ModalCard>
    </Modal>
  );
};

ModalItem.displayName = "Modal";
