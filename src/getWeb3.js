import Web3 from 'web3';
import detectEthereumProvider from '@metamask/detect-provider';

// supporting MetaMask initially
const connectToWallet = async (resolve, reject) => {
	const provider = await detectEthereumProvider();
	if (provider) {
		const web3 = new Web3(provider);
		try {
			// Request account access if needed
			await window.ethereum.enable();
			// Accounts now exposed
			resolve(web3);
		} catch (error) {
			reject(error);
		}
	}
	// Fallback to localhost; use dev console port by default...
	else {
		const provider = new Web3.providers.HttpProvider('http://127.0.0.1:7545');
		const web3 = new Web3(provider);
		console.log('No web3 instance injected, using Local web3.');
		resolve(web3);
	}
};

const getWeb3 = () =>
	new Promise((resolve, reject) => {
		connectToWallet(resolve, reject);
	});

export default getWeb3;
