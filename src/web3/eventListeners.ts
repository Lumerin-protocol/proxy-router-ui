import WalletConnectProvider from '@walletconnect/web3-provider';
import Web3 from 'web3';
import { ConnectInfo, Ethereum, WalletText } from '../types';
import { disconnectWalletConnectAsync, reconnectWalletAsync } from './helpers';

const ethereum = window.ethereum as Ethereum;

export const registerEventListeners: (
	walletName: string,
	provider: WalletConnectProvider | null,
	setAlertOpen: React.Dispatch<React.SetStateAction<boolean>>,
	setIsConnected: React.Dispatch<React.SetStateAction<boolean>>,
	setAccounts: React.Dispatch<React.SetStateAction<string[] | undefined>>
) => void = (walletName, provider, setAlertOpen, setIsConnected, setAccounts) => {
	const handleOnConnect: (connectInfo: ConnectInfo) => void = (connectInfo) => {
		console.log(`on connect: ${connectInfo.chainId}`);
		setIsConnected(false);
	};

	const handleOnDisconnect: (error: Error) => void = (error) => {
		console.log(`on disconnect: ${error.message}`);
		setAlertOpen(true);
		setIsConnected(false);
		if (walletName === WalletText.ConnectViaMetaMask) reconnectWalletAsync();
	};

	const handleChainChanged: (chainId: string) => void = async (chainId) => {
		console.log(`on chain changed: ${chainId}`);
		if (walletName === WalletText.ConnectViaWalletConnect) {
			const web3 = new Web3(provider as any);
			const chainId = await web3.eth.net.getId();
			if (chainId !== 3) {
				disconnectWalletConnectAsync(false, web3, setIsConnected);
				setAlertOpen(true);
				return;
			}
		}
		window.location.reload();
	};

	const handleAccountsChanged: (accounts: string[]) => void = (accounts) => {
		console.log('on accounts changed');
		if (accounts.length === 0 || accounts[0] === '') {
			setAlertOpen(true);
		} else {
			setAccounts(accounts);
		}
	};

	if (walletName === WalletText.ConnectViaMetaMask) {
		ethereum.on('connect', handleOnConnect);
		ethereum.on('disconnect', handleOnDisconnect);
		ethereum.on('chainChanged', handleChainChanged);
		ethereum.on('accountsChanged', handleAccountsChanged);
	} else {
		(provider as WalletConnectProvider).on('disconnect', handleOnDisconnect);
		(provider as WalletConnectProvider).on('chainChanged', handleChainChanged);
		(provider as WalletConnectProvider).on('accountsChanged', handleAccountsChanged);
	}
};
