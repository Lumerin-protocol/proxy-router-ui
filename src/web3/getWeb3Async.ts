import React from 'react';
import Web3 from 'web3';
import { provider } from 'web3-core/types/index';
import detectEthereumProvider from '@metamask/detect-provider';
import { registerEventListeners } from './eventListeners';
import Debug from 'debug';
const debug = Debug('getWeb3');

type Resolve = (web3: Web3) => void;
type Reject = (error: Error) => void;
type SetAlertOpen = React.Dispatch<React.SetStateAction<boolean>>;

const connectToMetaMaskAsync = async (resolve: Resolve, reject: Reject, setAlertOpen: SetAlertOpen) => {
	const provider: unknown = await detectEthereumProvider();
	if (provider) {
		registerEventListeners(setAlertOpen);
		const web3 = new Web3(provider as provider);
		try {
			// Request account access if needed
			await (window.ethereum as any).request({ method: 'eth_requestAccounts' });
			// Accounts now exposed
			resolve(web3);
		} catch (error) {
			reject(error);
		}
	} else {
		reject(new Error('Could not connect wallet'));
	}
};

// Could be extended to connect wallets other than MetaMask
const connectToWalletAsync = async (resolve: Resolve, reject: Reject, setAlertOpen: SetAlertOpen) => {
	connectToMetaMaskAsync(resolve, reject, setAlertOpen);
};

const getWeb3Async = (setAlertOpen: SetAlertOpen) =>
	new Promise<Web3>((resolve, reject) => {
		connectToWalletAsync(resolve, reject, setAlertOpen);
	});

export default getWeb3Async;
