import { ConnectInfo, Ethereum } from '../types';
import { reconnectWalletAsync } from './helpers';

const ethereum = window.ethereum as Ethereum;

export const registerEventListenersMetaMask: (
	setAlertOpen: React.Dispatch<React.SetStateAction<boolean>>,
	setIsConnected: React.Dispatch<React.SetStateAction<boolean>>,
	setAccounts: React.Dispatch<React.SetStateAction<string[] | undefined>>
) => void = (setAlertOpen, setIsConnected, setAccounts) => {
	const handleOnConnect: (connectInfo: ConnectInfo) => void = (connectInfo) => {
		console.log(`on connect: ${connectInfo.chainId}`);
		setIsConnected(false);
	};

	const handleOnDisconnect: (error: Error) => void = (error) => {
		console.log(`on disconnect: ${error.message}`);
		setAlertOpen(true);
		setIsConnected(false);
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
			setAlertOpen(true);
		} else {
			setAccounts(accounts);
		}
	};

	ethereum.on('connect', handleOnConnect);
	ethereum.on('disconnect', handleOnDisconnect);
	ethereum.on('chainChanged', handleChainChanged);
	ethereum.on('accountsChanged', handleAccountsChanged);
};
