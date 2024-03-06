import { IconButton, Modal } from '@mui/material';
import { ModalCard } from './Modal.styled';
import CloseIcon from '@mui/icons-material/Close';
import styled from '@emotion/styled';

interface ModalProps {
	open: boolean;
	onClose: () => void;
	content: React.ReactElement<any> | null;
}

export const ModalItem: React.FC<ModalProps> = ({ open, onClose, content }) => {
	return (
		<Modal open={open} onClose={onClose}>
			<ModalCard>
				<IconButton className='close' onClick={onClose}>
					<CloseIcon />
				</IconButton>
				{content}
			</ModalCard>
		</Modal>
	);
};
