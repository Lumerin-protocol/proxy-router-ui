import EastIcon from '@mui/icons-material/East';
import { MetaMaskIcon, WalletConnectIcon } from '../../../images';
import { useState } from 'react';

export const ConnectedWalletWidget = (props: {
	truncatedWalletAddress: string | null;
	addTokenToMetamask: Function;
	isMetamask: boolean;
	isMobile: boolean;
	handleDisconnect: () => void;
}) => {
	const [isHovering, setIsHovering] = useState(false);
	const label = props.isMetamask ? 'Change Account' : 'Disconnect';

	return (
		<div style={{ minWidth: '225px' }}>
			<div
				onClick={props.handleDisconnect}
				onMouseOver={() => setIsHovering(true)}
				onMouseOut={() => setIsHovering(false)}
				className='btn-connected cursor-pointer flex justify-evenly items-center px-8'
			>
				<span className='pr-3'>{isHovering ? label : props.truncatedWalletAddress}</span>
				{props.isMetamask ? <MetaMaskIcon /> : <WalletConnectIcon />}
			</div>
			<button className='link text-xs' onClick={() => props.addTokenToMetamask()}>
				<span style={{ display: 'flex', alignItems: 'center', color: '#fff' }}>
					Import LMR into MetaMask{' '}
					<EastIcon style={{ fontSize: '0.85rem', marginLeft: '0.25rem' }} />
				</span>
			</button>
		</div>
	);
};
