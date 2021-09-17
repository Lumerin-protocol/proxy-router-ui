import React from 'react';
import Web3 from 'web3';
import detectEthereumProvider from '@metamask/detect-provider';
import { AbiItem } from 'web3-utils';
import { Contract } from 'web3-eth-contract';
import { provider } from 'web3-core/types/index';
import { registerEventListeners } from './eventListeners';
import TestContract from '../contracts/TestingContract.json';
import { printError } from '../utils';

interface Networks {
	[networkId: number]: {
		address: string;
	};
}

interface ContractJson {
	networks: Networks;
}

interface Web3Result {
	accounts: string[];
	contractInstance: Contract;
	web3: Web3;
}

type Resolve = (web3: Web3) => void;
type Reject = (error: Error) => void;
type SetAlertOpen = React.Dispatch<React.SetStateAction<boolean>>;

// Web3 setup helpers
// Private functions for getWeb3ResultAsync()
const connectToMetaMaskAsync: (
	resolve: Resolve,
	reject: Reject,
	setAlertOpen: SetAlertOpen,
	setWalletText: React.Dispatch<React.SetStateAction<string>>
) => void = async (resolve, reject, setAlertOpen, setWalletText) => {
	const provider = (await detectEthereumProvider()) as provider;
	// If the provider returned by detectEthereumProvider is not the same as
	// window.ethereum, something is overwriting it, perhaps another wallet.
	if (provider && provider === window.ethereum) {
		registerEventListeners(setAlertOpen, setWalletText);
		const web3 = new Web3(provider);
		try {
			// Request account access if needed
			// Interface EthereumProvider is not an exported member
			// so can't extend it with interface merging to add request()
			await (window.ethereum as any).request({ method: 'eth_requestAccounts' });
			// Accounts now exposed
			resolve(web3);
		} catch (error) {
			const typedError = error as Error;
			printError(typedError.message, typedError.stack as string);
			reject(typedError);
		}
	} else {
		if (!provider) reject(new Error('Could not connect wallet'));
		if (provider !== window.ethereum) reject(new Error('Do you have multiple wallets installed?'));
	}
};

// Could be extended to connect wallets other than MetaMask
const connectToWalletAsync: (
	resolve: Resolve,
	reject: Reject,
	setAlertOpen: SetAlertOpen,
	setWalletText: React.Dispatch<React.SetStateAction<string>>
) => void = async (resolve, reject, setAlertOpen, setWalletText) => {
	connectToMetaMaskAsync(resolve, reject, setAlertOpen, setWalletText);
};

// Get web3 instance
const getWeb3Async: (setAlertOpen: SetAlertOpen, setWalletText: React.Dispatch<React.SetStateAction<string>>) => Promise<Web3> = (
	setAlertOpen,
	setWalletText
) =>
	new Promise<Web3>((resolve, reject) => {
		connectToWalletAsync(resolve, reject, setAlertOpen, setWalletText);
	});

// Get accounts, web3 and contract instances
export const getWeb3ResultAsync: (
	setOpenAlert: React.Dispatch<React.SetStateAction<boolean>>,
	setWalletText: React.Dispatch<React.SetStateAction<string>>
) => Promise<Web3Result | null> = async (setOpenAlert, setWalletText) => {
	try {
		// Get network provider and web3 instance
		const web3 = await getWeb3Async(setOpenAlert, setWalletText);
		// Use web3 to get the user's accounts
		const accounts = await web3.eth.getAccounts();
		if (accounts.length === 0 || accounts[0] === '') {
			setOpenAlert(true);
		}
		// Get the contract instance
		const networkId = 1631200230898;
		const deployedNetwork = (TestContract as ContractJson).networks[networkId];
		const contractInstance = new web3.eth.Contract(TestContract.abi as AbiItem[], deployedNetwork && deployedNetwork.address);
		return { accounts, contractInstance, web3 };
	} catch (error) {
		const typedError = error as Error;
		printError(typedError.message, typedError.stack as string);
		return null;
	}
};

// Wallet helpers
// Makes user choose which account they want to use in MetaMask
export const reconnectWallet: () => void = async () => {
	await (window.ethereum as any)?.request({
		method: 'wallet_requestPermissions',
		params: [
			{
				eth_accounts: {},
			},
		],
	});
};
