import { Bars3BottomLeftIcon } from '@heroicons/react/24/outline';
import { Toolbar, Typography } from '@mui/material';
import { LumerinIcon } from '../../images';
import styled from '@emotion/styled';
import { ConnectedWalletWidget } from './Widgets/ConnectedWalletWidget';
import { useWindowWidth } from '../../hooks/useWindowWidth';
import { useDisconnect } from 'wagmi';

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

export const Header = (prop: {
	setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
	pageTitle: string;
	truncatedWalletAddress: string | null;
	isMetamask: boolean;
	addTokenToMetamask: Function;
	drawerWidth: number;
	connectorIconUrl?: string;
}) => {
	const width = useWindowWidth();
	const {disconnect} = useDisconnect();
	const isMobile = width <= 768;

	return (
		<StyledToolbar>
			<button
				type='button'
				className='px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 md:hidden'
				onClick={() => prop.setSidebarOpen(true)}
			>
				<span className='sr-only'>Open sidebar</span>
				<Bars3BottomLeftIcon className='h-8 w-8' aria-hidden='true' />
			</button>
			<PageTitle>{prop.pageTitle}</PageTitle>
			{isMobile ? (
				<LumerinIcon onClick={()=>{disconnect()}}/>
			) : (
				<ConnectedWalletWidget
					iconUrl={prop.connectorIconUrl}
					addTokenToMetamask={prop.addTokenToMetamask}
					truncatedWalletAddress={prop.truncatedWalletAddress}
					isMobile={isMobile}
				/>
			)}
		</StyledToolbar>
	);
};
