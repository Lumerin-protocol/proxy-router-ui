import { MenuAlt2Icon } from '@heroicons/react/outline';
import { Toolbar } from '@mui/material';
import { MetaMaskIcon, WalletConnectIcon } from '../../images';
import EastIcon from '@mui/icons-material/East';
import styled from '@emotion/styled';

export const Header = (prop: {
	setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
	pageTitle: string;
	truncatedWalletAddress: string | null;
	isMetamask: boolean;
	addTokenToMetamask: Function;
	drawerWidth: number;
}) => {
	const StyledToolbar = styled(Toolbar)`
		display: flex;
		justify-content: space-between;
		padding: 0 !important;
	`;
	return (
		<StyledToolbar>
			<button
				type='button'
				className='px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 md:hidden'
				onClick={() => prop.setSidebarOpen(true)}
			>
				<span className='sr-only'>Open sidebar</span>
				<MenuAlt2Icon className='h-6 w-6' aria-hidden='true' />
			</button>
			<div className='flex items-center ml-1 md:ml-4 xl:ml-0'>
				<h1 className='text-xl font-semibold font-Raleway text-lumerin-blue-text'>
					{prop.pageTitle}
				</h1>
			</div>
			<div className='block justify-self-end'>
				<div className='btn-connected cursor-default flex justify-between items-center px-8'>
					<span className='pr-3'>{prop.truncatedWalletAddress}</span>
					{prop.isMetamask ? <MetaMaskIcon /> : <WalletConnectIcon />}
				</div>
				<button
					className='link text-xs text-lumerin-blue-text'
					onClick={() => prop.addTokenToMetamask()}
				>
					<span style={{ display: 'flex', alignItems: 'center' }}>
						Import LMR into MetaMask{' '}
						<EastIcon style={{ fontSize: '0.85rem', marginLeft: '0.25rem' }} />
					</span>
				</button>
			</div>
		</StyledToolbar>
	);
};
