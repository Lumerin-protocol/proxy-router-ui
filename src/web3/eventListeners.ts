import { WalletText } from '../components/Main';
import { reconnectWallet } from './helpers';
const ethereum: any = window.ethereum;

export const registerEventListeners: (
	setAlertOpen: React.Dispatch<React.SetStateAction<boolean>>,
	setWalletText: React.Dispatch<React.SetStateAction<string>>
) => void = (setAlertOpen, setWalletText) => {
	const showAlert = setAlertOpen;
	const changeWalletText = setWalletText;

	// connect
	interface ConnectInfo {
		chainId: string;
	}
	const handleOnConnect: (connectInfo: ConnectInfo) => void = (connectInfo) => {
		const changeWalletText = setWalletText;
		console.log(`on connect: ${connectInfo.chainId}`);
		changeWalletText(WalletText.Disconnect);
	};

	const handleOnDisconnect: (error: Error) => void = (error) => {
		console.log(`on disconnect: ${error.message}`);
		showAlert(true);
		changeWalletText(WalletText.ConnectViaMetaMask);
		reconnectWallet();
	};

	// chainChanged
	const handleChainChanged: (chainId: string) => void = (chainId) => {
		console.log(`on chain changed: ${chainId}`);
		window.location.reload();
	};

	// accountsChanged
	const handleAccountsChanged: (accounts: string[]) => void = (accounts) => {
		console.log('on accounts changed');
		if (accounts.length === 0 || accounts[0] === '') {
			// MetaMask is locked or the user has not connected any accounts
			showAlert(true);
			changeWalletText(WalletText.ConnectViaMetaMask);
		} else {
			changeWalletText(WalletText.Disconnect);
		}
	};

	ethereum.on('connect', handleOnConnect);
	ethereum.on('disconnect', handleOnDisconnect);
	ethereum.on('chainChanged', handleChainChanged);
	ethereum.on('accountsChanged', handleAccountsChanged);
};
