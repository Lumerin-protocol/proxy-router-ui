import { IconButton, Modal } from '@mui/material';
import { ModalCard } from './Modal.styled';
import CloseIcon from '@mui/icons-material/Close';
import styled from '@emotion/styled';

interface ModalProps {
	open: boolean;
	onClose: () => void;
	content: React.ReactElement<any> | null;
}

const StyledModal = styled(Modal)`
	position: absolute;
	top: 10%;
	overflow: scroll;
	min-height: 100%;
	display: block;
	@media (max-width: 600px) {
		/* top: 5%; */
	}
`;

export const ModalItem: React.FC<ModalProps> = ({ open, onClose, content }) => {
	return (
		<StyledModal open={open} onClose={onClose}>
			<ModalCard>
				<IconButton className='close' onClick={onClose}>
					<CloseIcon />
				</IconButton>
				{content}
			</ModalCard>
		</StyledModal>
	);
};
