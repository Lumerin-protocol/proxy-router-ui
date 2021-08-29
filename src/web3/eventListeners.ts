import { WalletText } from '../components/Main';
import { reconnectWallet } from './utils';
const ethereum: any = window.ethereum;

export const registerEventListeners: (
	setAlertOpen: React.Dispatch<React.SetStateAction<boolean>>,
	setWalletText: React.Dispatch<React.SetStateAction<string>>
) => void = (setAlertOpen, setWalletText) => {
	// connect
	const handleOnConnect: (chainId: string, setWalletText: React.Dispatch<React.SetStateAction<string>>) => void = (chainId, setWalletText) => {
		console.log('on connect');
		setWalletText(WalletText.Disconnect);
	};

	const handleOnDisconnect: (error: Error) => void = (error) => {
		console.log(error.message);
		reconnectWallet();
	};

	// chainChanged
	const handleChainChanged: (chainId: string) => void = (chainId) => {
		window.location.reload();
	};

	// accountsChanged
	const handleAccountsChanged: (accounts: string[], setWalletText: React.Dispatch<React.SetStateAction<string>>) => void = (
		accounts,
		setWalletText
	) => {
		if (accounts.length === 0 || accounts[0] === '') {
			// MetaMask is locked or the user has not connected any accounts
			setAlertOpen(true);
		} else {
			setWalletText(WalletText.Disconnect);
		}
	};

	ethereum.on('connect', (chainId: string, setWalletText: React.Dispatch<React.SetStateAction<string>>) => handleOnConnect(chainId, setWalletText));
	ethereum.on('disconnect', handleOnDisconnect);
	ethereum.on('chainChanged', handleChainChanged);
	ethereum.on('accountsChanged', (accounts: string[]) => handleAccountsChanged(accounts, setWalletText));
};
