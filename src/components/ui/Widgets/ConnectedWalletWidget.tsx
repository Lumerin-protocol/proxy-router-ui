import EastIcon from '@mui/icons-material/East';
import { LumerinIcon } from '../../../images';

export const ConnectedWalletWidget = (props: {
	iconUrl?: string;
	truncatedWalletAddress: string | null;
	addTokenToMetamask: Function;
	isMobile: boolean;
}) => {
	return (
		<div>
			<div className='btn-connected cursor-default flex justify-between items-center px-8'>
				<span className='pr-3'>{props.truncatedWalletAddress}</span>
				{props.iconUrl ? (
					<img className='w-7' alt='provider icon' src={props.iconUrl} />
				) : (
					<LumerinIcon className='w-7' />
				)}
			</div>
			<button
				className='link text-xs text-lumerin-blue-text'
				onClick={() => props.addTokenToMetamask()}
			>
				<span style={{ display: 'flex', alignItems: 'center' }}>
					Import LMR into your wallet{' '}
					<EastIcon style={{ fontSize: '0.85rem', marginLeft: '0.25rem' }} />
				</span>
			</button>
		</div>
	);
};
