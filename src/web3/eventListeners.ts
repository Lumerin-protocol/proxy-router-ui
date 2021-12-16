import { ConnectInfo, Ethereum, WalletText } from '../types';
import { reconnectWalletAsync } from './helpers';

const ethereum = window.ethereum as Ethereum;

export const registerEventListeners: (
	setAlertOpen: React.Dispatch<React.SetStateAction<boolean>>,
	setWalletText: React.Dispatch<React.SetStateAction<string>>,
	setAccounts: React.Dispatch<React.SetStateAction<string[] | undefined>>
) => void = (setAlertOpen, setWalletText, setAccounts) => {
	const showAlert = setAlertOpen;
	const changeWalletText = setWalletText;
	const changeAccounts = setAccounts;

	const handleOnConnect: (connectInfo: ConnectInfo) => void = (connectInfo) => {
		console.log(`on connect: ${connectInfo.chainId}`);
		changeWalletText(WalletText.Disconnect);
	};

	const handleOnDisconnect: (error: Error) => void = (error) => {
		console.log(`on disconnect: ${error.message}`);
		showAlert(true);
		changeWalletText(WalletText.ConnectViaMetaMask);
		reconnectWalletAsync();
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
			changeAccounts(accounts);
		}
	};

	ethereum.on('connect', handleOnConnect);
	ethereum.on('disconnect', handleOnDisconnect);
	ethereum.on('chainChanged', handleChainChanged);
	ethereum.on('accountsChanged', handleAccountsChanged);
};
