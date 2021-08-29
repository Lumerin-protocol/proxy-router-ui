import React from 'react';
import Web3 from 'web3';
import { provider } from 'web3-core/types/index';
import detectEthereumProvider from '@metamask/detect-provider';
import { registerEventListeners } from './eventListeners';

type Resolve = (web3: Web3) => void;
type Reject = (error: Error) => void;
type SetAlertOpen = React.Dispatch<React.SetStateAction<boolean>>;

const connectToMetaMaskAsync = async (
	resolve: Resolve,
	reject: Reject,
	setAlertOpen: SetAlertOpen,
	setWalletText: React.Dispatch<React.SetStateAction<string>>
) => {
	const provider: unknown = await detectEthereumProvider();
	if (provider) {
		registerEventListeners(setAlertOpen, setWalletText);
		const web3 = new Web3(provider as provider);
		try {
			// Request account access if needed
			await (window.ethereum as any).request({ method: 'eth_requestAccounts' });
			// Accounts now exposed
			resolve(web3);
		} catch (error) {
			reject(error as Error);
		}
	} else {
		reject(new Error('Could not connect wallet'));
	}
};

// Could be extended to connect wallets other than MetaMask
const connectToWalletAsync = async (
	resolve: Resolve,
	reject: Reject,
	setAlertOpen: SetAlertOpen,
	setWalletText: React.Dispatch<React.SetStateAction<string>>
) => {
	connectToMetaMaskAsync(resolve, reject, setAlertOpen, setWalletText);
};

const getWeb3Async = (setAlertOpen: SetAlertOpen, setWalletText: React.Dispatch<React.SetStateAction<string>>) =>
	new Promise<Web3>((resolve, reject) => {
		connectToWalletAsync(resolve, reject, setAlertOpen, setWalletText);
	});

export default getWeb3Async;
