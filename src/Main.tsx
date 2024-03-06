import styled from '@emotion/styled';
import React, { useEffect, useState } from 'react';
import Bg from './images/bg.png';
import { Hero } from './pages/Hero';
import { AddressLength, PathName } from './types';
import Box from '@mui/material/Box';
import { ResponsiveNavigation } from './components/navigation/Navigation';
import { Header } from './components/ui/Header';
import { truncateAddress } from './utils';
import { useAccount, useAccountEffect } from 'wagmi';
import { useHistory, useLocation } from 'react-router';
import { MarketplaceState } from './MarketplaceState';
import { addLumerinTokenToMetaMaskAsync } from './web3/helpers';

const BodyWrapper = styled.div`
	display: flex;
	min-height: 100vh;
	background: #eaf7fc;
	background-image: url(${Bg});
	background-size: 100% 100%;
	background-attachment: fixed;
`;

const sidebarDrawerWidth = 240;

const getPageTitle = (pathname: string): string => {
	switch (pathname) {
		case PathName.Marketplace:
			return 'Marketplace';
		case PathName.MyOrders:
			return 'Buyer Hub';
		case PathName.MyContracts:
			return 'Seller Hub';
		default:
			return 'Home';
	}
};

const getTruncatedWalletAddress = (userAccount?: string): string | null => {
	if (userAccount) {
		return truncateAddress(userAccount, AddressLength.MEDIUM);
	}

	return null;
};

const SidebarBox = (props: { children: any }) => (
	<Box component='nav' sx={{ width: { md: sidebarDrawerWidth }, flexShrink: { sm: 0 } }}>
		{props.children}
	</Box>
);

const MainBox = (props: { children: any }) => (
	<Box
		sx={{
			marginLeft: 'auto',
			flexGrow: 1,
			p: 3,
			width: { xs: `100%`, sm: `100%`, md: `calc(100% - ${sidebarDrawerWidth}px)` },
			minHeight: '100vh',
		}}
	>
		{props.children}
	</Box>
);

// Main UI component
export const Main: React.FC = () => {
	const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
	const location = useLocation();
	const history = useHistory();

	const { isDisconnected, connector, address } = useAccount();

	useEffect(() => {
		if (isDisconnected && location.pathname !== PathName.Home) {
			console.log('DISCONNECTED', location);
			history.push(PathName.Home);
		}
	}, [isDisconnected]);

	useAccountEffect({
		onConnect: ({ chainId }) => {
			if (chainId === Number(process.env.REACT_APP_CHAIN_ID!)) {
				history.push(PathName.Marketplace);
			}
		},
	});

	if (location.pathname === PathName.Home) {
		return <Hero />;
	}

	return (
		<BodyWrapper>
			<SidebarBox>
				<ResponsiveNavigation
					sidebarOpen={sidebarOpen}
					setSidebarOpen={setSidebarOpen}
					drawerWidth={sidebarDrawerWidth}
				/>
			</SidebarBox>
			<MainBox>
				<Header
					connectorIconUrl={connector?.icon}
					setSidebarOpen={setSidebarOpen}
					pageTitle={getPageTitle(location.pathname)}
					truncatedWalletAddress={getTruncatedWalletAddress(address)}
					addTokenToMetamask={addLumerinTokenToMetaMaskAsync}
					isMetamask={true}
					drawerWidth={sidebarDrawerWidth}
				/>
				<Box component='main'>
					<main>
						<MarketplaceState />
					</main>
				</Box>
			</MainBox>
		</BodyWrapper>
	);
};
