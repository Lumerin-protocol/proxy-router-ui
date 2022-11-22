import { IconButton, Modal } from '@mui/material';
import { ModalCard } from './Modal.styled';
import CloseIcon from '@mui/icons-material/Close';
import styled from '@emotion/styled';
interface ModalProps {
	open: boolean;
	setOpen: React.Dispatch<React.SetStateAction<boolean>>;
	content: JSX.Element;
}

const StyledModal = styled(Modal)`
	position: absolute;
	top: 10%;
	overflow: scroll;
	height: 100%;
	display: block;
`;

export const ModalItem: React.FC<ModalProps> = ({ open, setOpen, content }) => {
	return (
		<StyledModal open={open} onClose={() => setOpen}>
			<ModalCard>
				<IconButton className='close' onClick={() => setOpen(false)}>
					<CloseIcon />
				</IconButton>
				{content}
			</ModalCard>
		</StyledModal>
	);
};

ModalItem.displayName = 'Modal';
ModalItem.whyDidYouRender = false;
