import { IconButton, Modal } from '@mui/material';
import { ModalCard } from './Modal.styled';
import CloseIcon from '@mui/icons-material/Close';
interface ModalProps {
	open: boolean;
	setOpen: React.Dispatch<React.SetStateAction<boolean>>;
	content: React.ReactElement<any>;
}

export const ModalItem: React.FC<ModalProps> = ({ open, setOpen, content }) => {
	return (
		<Modal open={open} onClose={() => setOpen}>
			<ModalCard>
				<IconButton className='close' sx={{ color: 'white' }} onClick={() => setOpen(false)}>
					<CloseIcon />
				</IconButton>
				{content}
			</ModalCard>
		</Modal>
	);
};

ModalItem.displayName = 'Modal';
ModalItem.whyDidYouRender = false;
