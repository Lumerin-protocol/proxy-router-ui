import './wdyr.ts';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { App } from './App';
import { ErrorPage } from './components/ui/ErrorPage';
import reportWebVitals from './reportWebVitals';
import './index.css';
import './fonts.css';

import { createWeb3Modal } from '@web3modal/wagmi/react';
import { arbitrum, arbitrumSepolia, hardhat } from 'viem/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Config, WagmiProvider } from 'wagmi';
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config';

const root = document.getElementById('root');
if (!root) {
	throw new Error('No root element found');
}

// 0. Setup queryClient
const queryClient = new QueryClient();

// 1. Get projectId at https://cloud.walletconnect.com
const projectId = 'd446f07d76ee165409a0e1d967488a51';

// 2. Create wagmiConfig
const metadata = {
	name: 'Web3Modal',
	description: 'Web3Modal Example',
	url: 'https://web3modal.com', // origin must match your domain & subdomain
	icons: ['https://avatars.githubusercontent.com/u/37784886'],
};

const getChainById = () => {
	const chainId = process.env.REACT_APP_CHAIN_ID;
	switch (Number(chainId)) {
		case hardhat.id:
			return hardhat;
		case arbitrumSepolia.id:
			return arbitrumSepolia;
		case arbitrum.id:
			return arbitrum;
		default:
			throw new Error(
				`invalid chain id provided in REACT_APP_CHAIN_ID "${chainId}". Only arbitrum, arbitrumSepolia and hardhat chains are supported`
			);
	}
};

const config: Config = defaultWagmiConfig({
	chains: [getChainById()], // required
	projectId, // required
	metadata, // required
	enableWalletConnect: true, // Optional - true by default
	enableInjected: true, // Optional - true by default
	enableEIP6963: true, // Optional - true by default
	enableCoinbase: true, // Optional - true by default
	// ...wagmiOptions // Optional - Override createConfig parameters
});

// 3. Create modal
createWeb3Modal({
	tokens: {
		[Number(hardhat.id)]: { address: process.env.REACT_APP_LUMERIN_TOKEN_ADDRESS! },
	},
	wagmiConfig: config,
	projectId,
	enableAnalytics: true, // Optional - defaults to your Cloud configuration
});

createRoot(root).render(
	<React.StrictMode>
		<BrowserRouter>
			<ErrorBoundary fallbackRender={ErrorPage}>
				<WagmiProvider config={config}>
					<QueryClientProvider client={queryClient}>
						<App />
					</QueryClientProvider>
				</WagmiProvider>
			</ErrorBoundary>
		</BrowserRouter>
	</React.StrictMode>
);

reportWebVitals();
