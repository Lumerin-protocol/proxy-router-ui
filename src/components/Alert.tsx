import Dialog from "@mui/material/Dialog";
import { ModalBox } from "./Modal.styled";

interface AlertProps {
  message: string;
  isOpen: boolean;
  onClose: React.Dispatch<React.SetStateAction<boolean>>;
  onClick?: () => void;
}

export const Alert: React.FC<AlertProps> = ({ message, isOpen, onClose, onClick }) => {
  return (
    <Dialog open={isOpen} onClose={onClose} PaperProps={{ style: { borderRadius: 20 } }}>
      <ModalBox>
        <div className="modal-card">
          <button
            type="button"
            style={{ background: "#383838" }}
            className="inline-flex justify-center w-full bg-white text-base text-color-white font-medium"
            onClick={onClick ? () => onClick() : () => {}}
          >
            <h3 className="text-md font-medium">{message}</h3>
          </button>
        </div>
      </ModalBox>
    </Dialog>
  );
};

Alert.displayName = "Alert";
