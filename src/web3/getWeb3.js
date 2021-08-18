import Web3 from 'web3';
import detectEthereumProvider from '@metamask/detect-provider';
import { registerEventListeners } from './eventListeners.ts';
import Debug from 'debug';
const debug = Debug('getWeb3');

const connectToMetaMask = async (resolve, reject, setAlertOpen) => {
	const provider = await detectEthereumProvider();
	if (provider) {
		registerEventListeners(setAlertOpen);
		const web3 = new Web3(provider);
		try {
			// Request account access if needed
			await window.ethereum.request({ method: 'eth_requestAccounts' });
			// Accounts now exposed
			resolve(web3);
		} catch (error) {
			reject(error);
		}
	} else {
		reject();
	}
};

// Could be extended to connect wallets other than MetaMask
const connectToWallet = async (resolve, reject, setAlertOpen) => {
	connectToMetaMask(resolve, reject, setAlertOpen);
};

const getWeb3 = (setAlertOpen) =>
	new Promise((resolve, reject) => {
		connectToWallet(resolve, reject, setAlertOpen);
	});

export default getWeb3;
