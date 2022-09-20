import { Modal } from '@mui/material';

interface ModalProps {
	open: boolean;
	setOpen: React.Dispatch<React.SetStateAction<boolean>>;
	content: JSX.Element;
}

export const ModalItem: React.FC<ModalProps> = ({ open, setOpen, content }) => {
	return (
		<Modal open={open} onClose={() => setOpen}>
			<div className='modal-card'>{content}</div>
		</Modal>
	);
};

ModalItem.displayName = 'Modal';
ModalItem.whyDidYouRender = false;
