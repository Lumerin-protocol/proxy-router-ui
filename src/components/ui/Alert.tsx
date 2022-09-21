import { Modal } from '@mui/material';
import { ModalBox } from './Modal.styled';

interface AlertProps {
	message: string;
	open: boolean;
	setOpen: React.Dispatch<React.SetStateAction<boolean>>;
	onClick?: () => void;
}

export const Alert: React.FC<AlertProps> = ({ message, open, setOpen, onClick }) => {
	return (
		<Modal open={open} onClose={setOpen}>
			<ModalBox>
				<div className='modal-card'>
					<button
						type='button'
						className='inline-flex justify-center w-full bg-white text-base text-color-white font-medium'
						onClick={onClick ? () => onClick() : () => {}}
					>
						<div className='ml-3'>
							<h3 className='text-md font-medium text-lumerin-aqua'>{message}</h3>
						</div>
					</button>
				</div>
			</ModalBox>
		</Modal>
	);
};

Alert.displayName = 'Alert';
Alert.whyDidYouRender = false;
