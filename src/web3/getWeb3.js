import Web3 from 'web3';
import detectEthereumProvider from '@metamask/detect-provider';
import WalletConnectProvider from '@walletconnect/web3-provider';

const METAMASK = 'MetaMask';
const WALLETCONNECT = 'WalletConnect';
const COINBASE_WALLET = 'Coinbase Wallet';
let provider = null;

const connectWithProvider = async (resolve, reject, provider) => {
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
	} else {
		reject();
	}
};

// TODO: decide if this is needed for Stage 1
const connectWithWalletConnect = async (resolve, reject) => {
	const provider = new WalletConnectProvider({
		infuraId: '27e484dcd9e3efcfd25a83a78777cdf1',
	});

	await connectWithProvider(resolve, reject, provider);
};

const connectToWallet = async (resolve, reject, walletName) => {
	switch (walletName) {
		case METAMASK:
			provider = await detectEthereumProvider();
			await connectWithProvider(resolve, reject, provider);
			break;
		case WALLETCONNECT:
			await connectWithWalletConnect(resolve, reject);
			break;
		case COINBASE_WALLET:
			provider = null;
			break;
		default:
			break;
	}
};

const getWeb3 = (walletName) =>
	new Promise((resolve, reject) => {
		connectToWallet(resolve, reject, walletName);
	});

export default getWeb3;
