import { Dialog } from '@mui/material';
import { PrimaryButton } from './Forms/FormButtons/Buttons.styled';
import { NetworkBox } from './Modal.styled';

interface AlertProps {
	message: string;
	open: boolean;
	setOpen: React.Dispatch<React.SetStateAction<boolean>>;
	onClick?: () => void;
}

export const SwitchNetworkAlert: React.FC<AlertProps> = ({ message, open, setOpen, onClick }) => {
	return (
		<Dialog open={open} onClose={setOpen} PaperProps={{ style: { borderRadius: 20 } }}>
			<NetworkBox>
				<h3>Switch Network</h3>
				<p>
					Your wallet must be connected to the Goerli testnet to use the Marketplace. Please change
					the network in your wallet, or click the button below.
				</p>
				<PrimaryButton
					type='button'
					className='inline-flex justify-center w-full bg-white text-base text-color-white font-medium'
					onClick={onClick ? () => onClick() : () => {}}
				>
					Switch Network
				</PrimaryButton>
			</NetworkBox>
		</Dialog>
	);
};

SwitchNetworkAlert.displayName = 'Alert';
SwitchNetworkAlert.whyDidYouRender = false;
