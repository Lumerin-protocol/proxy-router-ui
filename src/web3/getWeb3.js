import Web3 from 'web3';
import detectEthereumProvider from '@metamask/detect-provider';
import Debug from 'debug';
const debug = Debug('getWeb3');

const connectToMetaMask = async (resolve, reject) => {
	debug('connecting to MetaMask');
	const provider = await detectEthereumProvider();
	if (provider) {
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
const connectToWallet = async (resolve, reject) => {
	connectToMetaMask(resolve, reject);
};

const getWeb3 = () =>
	new Promise((resolve, reject) => {
		connectToWallet(resolve, reject);
	});

export default getWeb3;
