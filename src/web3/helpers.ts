import React, { Dispatch, SetStateAction } from 'react';
import Web3 from 'web3';
import detectEthereumProvider from '@metamask/detect-provider';
import lumerin from '../images/lumerin_metamask.png';
import { AbiItem } from 'web3-utils';
import { Contract } from 'web3-eth-contract';
import { provider } from 'web3-core/types/index';
import { registerEventListeners } from './eventListeners';
import CloneFactory from '../contracts/CloneFactory.json';
import LumerinContract from '../contracts/Lumerin.json';
import { ContractJson, Ethereum, Receipt, WalletText } from '../types';
import { printError } from '../utils';
import WalletConnectProvider from '@walletconnect/web3-provider';

interface Web3Result {
	accounts: string[];
	contractInstance: Contract;
	web3: Web3;
}

const ethereum = window.ethereum as Ethereum;
const lumerinTokenAddress = '0xC6a30Bc2e1D7D9e9FFa5b45a21b6bDCBc109aE1B';

// Web3 setup helpers
const getProviderAsync: (walletName: string) => Promise<provider | WalletConnectProvider> = async (walletName) => {
	switch (walletName) {
		case WalletText.ConnectViaMetaMask:
			return (await detectEthereumProvider()) as provider;
		default:
			return new WalletConnectProvider({
				rpc: {
					1: '',
					3: '',
				},
				chainId: 3,
				clientMeta: {
					description: 'Welcome to the Global Hashpower Marketplace.',
					url: '',
					icons: [''],
					name: 'Global Hashpower Marketplace',
				},
			});
	}
};

// Get accounts, web3 and contract instances
export const getWeb3ResultAsync: (
	setAlertOpen: React.Dispatch<React.SetStateAction<boolean>>,
	setIsConnected: React.Dispatch<React.SetStateAction<boolean>>,
	setAccounts: React.Dispatch<React.SetStateAction<string[] | undefined>>,
	walletName: string
) => Promise<Web3Result | null> = async (setAlertOpen, setIsConnected, setAccounts, walletName) => {
	try {
		const provider = await getProviderAsync(walletName);
		if (provider) {
			registerEventListeners(
				walletName,
				walletName === WalletText.ConnectViaWalletConnect ? (provider as WalletConnectProvider) : null,
				setAlertOpen,
				setIsConnected,
				setAccounts
			);
			// Expose accounts
			if (walletName === WalletText.ConnectViaMetaMask) await ethereum.request({ method: 'eth_requestAccounts' });
			else await (provider as WalletConnectProvider).enable();
			const web3 = new Web3(provider as provider);
			const networkId = await web3.eth.net.getId();
			const deployedNetwork = (CloneFactory as ContractJson).networks[networkId];
			const accounts = await web3.eth.getAccounts();
			if (accounts.length === 0 || accounts[0] === '') {
				setAlertOpen(true);
			}
			const contractInstance = new web3.eth.Contract(CloneFactory.abi as AbiItem[], deployedNetwork && deployedNetwork.address);
			return { accounts, contractInstance, web3 };
		}
		return null;
	} catch (error) {
		const typedError = error as Error;
		printError(typedError.message, typedError.stack as string);
		return null;
	}
};

// Wallet helpers
// Allows user to choose which account they want to use in MetaMask
export const reconnectWalletAsync: () => void = async () => {
	await ethereum?.request({
		method: 'wallet_requestPermissions',
		params: [
			{
				eth_accounts: {},
			},
		],
	});
};

export const disconnectWalletConnectAsync: (isMetaMask: boolean, web3: Web3, setIsConnected: Dispatch<SetStateAction<boolean>>) => void = async (
	isMetaMask,
	web3,
	setIsConnected
) => {
	if (!isMetaMask) {
		await (web3?.currentProvider as unknown as WalletConnectProvider)?.disconnect();
		setIsConnected(false);
	}
};

// https://docs.metamask.io/guide/registering-your-token.html#example
export const addLumerinTokenToMetaMaskAsync: () => void = async () => {
	try {
		await ethereum?.request({
			method: 'wallet_watchAsset',
			params: {
				type: 'ERC20',
				options: {
					address: lumerinTokenAddress,
					symbol: 'LMR',
					decimals: 8,
					image: lumerin,
				},
			},
		});
	} catch (error) {
		const typedError = error as Error;
		printError(typedError.message, typedError.stack as string);
	}
};

export const getLumerinTokenBalanceAsync: (web3: Web3, userAccount: string) => Promise<number | null> = async (web3, userAccount) => {
	const lumerinContractInstance = new web3.eth.Contract(LumerinContract.abi as AbiItem[], lumerinTokenAddress);

	try {
		const lumerinBalance: string = await lumerinContractInstance.methods.balanceOf(userAccount).call();
		return divideByDigits(parseInt(lumerinBalance));
	} catch (error) {
		const typedError = error as Error;
		printError(typedError.message, typedError.stack as string);
		return null;
	}
};

export const transferLumerinAsync: (web3: Web3, userAccount: string, sellerAccount: string, amount: number) => Promise<Receipt> = async (
	web3,
	userAccount,
	sellerAccount,
	amount
) => {
	const networkId = await web3.eth.net.getId();
	const deployedNetwork = (LumerinContract as ContractJson).networks[networkId];
	const lumerinContractInstance = new web3.eth.Contract(LumerinContract.abi as AbiItem[], deployedNetwork && deployedNetwork.address);
	return await lumerinContractInstance.methods.transfer(sellerAccount, multiplyByDigits(amount)).send({ from: userAccount, gas: 1000000 });
};

export const multiplyByDigits: (amount: number) => number = (amount) => {
	return amount * 10 ** 8;
};

export const divideByDigits: (amount: number) => number = (amount) => {
	return amount / 10 ** 8;
};
