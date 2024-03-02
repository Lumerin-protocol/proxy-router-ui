import styled from '@emotion/styled';
import React, { useState } from 'react';
import Bg from './images/bg.png';
import { Hero } from './pages/Hero';
import { ConnectButtonsWrapper } from './components/ui/Forms/FormButtons/Buttons.styled';
import { AddressLength, CurrentTab, HashRentalContract, PathName, WalletText } from './types';
import { MetaMaskIcon } from './images';
import { SwitchNetworkAlert } from './components/ui/SwitchNetworkAlert';
import Box from '@mui/material/Box';
import { ResponsiveNavigation } from './components/navigation/Navigation';
import { Header } from './components/ui/Header';
import { truncateAddress } from './utils';
import { Router } from './Router';

interface MainProps {
	userAccount: string;
	isConnected: boolean;
	isMetamask: boolean;
	isMobile: boolean;
	currentBlockTimestamp: number;
	contracts: HashRentalContract[];
	lumerinBalance: number;
	getAlertMessage: () => string;
	// actions with state
	pathName: string;
	setPathName: (path: string) => void;
	alertOpen: boolean;
	setAlertOpen: (open: boolean) => void;
	activeOrdersTab: CurrentTab;
	setActiveOrdersTab: (tab: CurrentTab) => void;
	// actions
	connectWallet: (walletType: WalletText) => void;
	changeNetworkAsync: () => void;
	addLumerinTokenToMetaMaskAsync: () => void;
	refreshContracts: () => void;
}

const BodyWrapper = styled.div`
	display: flex;
	min-height: 100vh;
	background: #eaf7fc;
	background-image: url(${Bg});
	background-size: 100% 100%;
	background-attachment: fixed;
`;

const sidebarDrawerWidth = 240;

const getPageTitle = (pathName: string): string => {
	if (pathName === PathName.Marketplace) return 'Marketplace';
	if (pathName === PathName.MyOrders) return 'Buyer Hub';
	if (pathName === PathName.MyContracts) return 'Seller Hub';
	return '';
};

const getTruncatedWalletAddress = (userAccount: string): string | null => {
	if (userAccount) {
		return truncateAddress(userAccount, AddressLength.MEDIUM);
	}

	return null;
};

// Main UI component
export const Main: React.FC<MainProps> = (props) => {
	const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

	if (!props.isConnected) {
		return (
			<Hero
				actionButtons={
					<ConnectButtonsWrapper>
						<button
							type='button'
							onClick={() => props.connectWallet(WalletText.ConnectViaMetaMask)}
						>
							<span>{WalletText.ConnectViaMetaMask}</span>
							<MetaMaskIcon />
						</button>
						{/* <button type='button' onClick={() => connectWallet(WalletText.ConnectViaWalletConnect)}>
				<span>{WalletText.ConnectViaWalletConnect}</span>
				<WalletConnectIcon />
			</button> */}
					</ConnectButtonsWrapper>
				}
			/>
		);
	}

	return (
		<BodyWrapper>
			<SwitchNetworkAlert
				message={props.getAlertMessage()}
				open={props.alertOpen}
				setOpen={() => props.setAlertOpen(false)}
				onClick={() => props.changeNetworkAsync()}
			/>
			<Box component='nav' sx={{ width: { md: sidebarDrawerWidth }, flexShrink: { sm: 0 } }}>
				<ResponsiveNavigation
					sidebarOpen={sidebarOpen}
					setSidebarOpen={setSidebarOpen}
					setPathname={props.setPathName}
					pathName={props.pathName}
					drawerWidth={sidebarDrawerWidth}
				/>
			</Box>
			<Box
				sx={{
					marginLeft: 'auto',
					flexGrow: 1,
					p: 3,
					width: { xs: `100%`, sm: `100%`, md: `calc(100% - ${sidebarDrawerWidth}px)` },
					minHeight: '100vh',
				}}
			>
				<Header
					setSidebarOpen={setSidebarOpen}
					pageTitle={getPageTitle(props.pathName)}
					truncatedWalletAddress={getTruncatedWalletAddress(props.userAccount)}
					addTokenToMetamask={props.addLumerinTokenToMetaMaskAsync}
					isMetamask={props.isMetamask}
					isMobile={props.isMobile}
					drawerWidth={sidebarDrawerWidth}
				/>
				<Box component='main'>
					<main>
						<Router
							userAccount={props.userAccount}
							lumerinBalance={props.lumerinBalance}
							contracts={props.contracts}
							currentBlockTimestamp={props.currentBlockTimestamp}
							isMobile={props.isMobile}
							refreshContracts={props.refreshContracts}
							activeOrdersTab={props.activeOrdersTab}
							setActiveOrdersTab={props.setActiveOrdersTab}
						/>
					</main>
				</Box>
			</Box>
		</BodyWrapper>
	);
};
