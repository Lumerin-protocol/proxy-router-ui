import { MenuAlt2Icon } from '@heroicons/react/outline';
import { Toolbar, Typography } from '@mui/material';
import { LumerinIcon, MetaMaskIcon, WalletConnectIcon, LogoIcon } from '../../images';
import EastIcon from '@mui/icons-material/East';
import styled from '@emotion/styled';
import { ConnectedWalletWidget } from './Widgets/ConnectedWalletWidget';

export const Header = (prop: {
	setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
	pageTitle: string;
	truncatedWalletAddress: string | null;
	isMetamask: boolean;
	isMobile: boolean;
	addTokenToMetamask: Function;
	drawerWidth: number;
}) => {
	const StyledToolbar = styled(Toolbar)`
		display: flex;
		justify-content: space-between;
		padding: 0 !important;
	`;

	const PageTitle = styled(Typography)`
		color: #004c5f;
		font-weight: 600;
		font-family: Raleway, sans-serif;
		font-size: 2rem;
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
			<PageTitle>{prop.pageTitle}</PageTitle>
			{prop.isMobile ? (
				<LumerinIcon />
			) : (
				<ConnectedWalletWidget
					addTokenToMetamask={prop.addTokenToMetamask}
					truncatedWalletAddress={prop.truncatedWalletAddress}
					isMetamask={prop.isMetamask}
					isMobile={prop.isMobile}
				/>
			)}
		</StyledToolbar>
	);
};
