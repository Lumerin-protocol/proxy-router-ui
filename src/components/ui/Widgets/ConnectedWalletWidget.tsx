import EastIcon from '@mui/icons-material/East';
import styled from '@emotion/styled';
import { SmallWidget } from '../Cards/Cards.styled';
import { MetaMaskIcon, WalletConnectIcon } from '../../../images';

export const ConnectedWalletWidget = (props: {
	iconUrl?: string;
	truncatedWalletAddress: string | null;
	addTokenToMetamask: Function;
	isMetamask: boolean;
	isMobile: boolean;
}) => {
	return (
		<div>
			<div className='btn-connected cursor-default flex justify-between items-center px-8'>
				<span className='pr-3'>{props.truncatedWalletAddress}</span>
				<img className='w-7' src={props.iconUrl} />
			</div>
			<button
				className='link text-xs text-lumerin-blue-text'
				onClick={() => props.addTokenToMetamask()}
			>
				<span style={{ display: 'flex', alignItems: 'center' }}>
					Import LMR into MetaMask{' '}
					<EastIcon style={{ fontSize: '0.85rem', marginLeft: '0.25rem' }} />
				</span>
			</button>
		</div>
	);
};
