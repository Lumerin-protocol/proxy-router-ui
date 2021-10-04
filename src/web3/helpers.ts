import React from 'react';
import Web3 from 'web3';
import detectEthereumProvider from '@metamask/detect-provider';
import lumerin from '../images/lumerin_metamask.png';
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

const ethereum: any = window.ethereum;
const lumerinTokenAddress = '0xb451cD81ed62D69C559d8721601E4B2a06Fc52Ff';

// Web3 setup helpers
// Private functions for getWeb3ResultAsync()
const connectToMetaMaskAsync: (
	resolve: Resolve,
	reject: Reject,
	setAlertOpen: SetAlertOpen,
	setWalletText: React.Dispatch<React.SetStateAction<string>>,
	setAccounts: React.Dispatch<React.SetStateAction<string[] | undefined>>
) => void = async (resolve, reject, setAlertOpen, setWalletText, setAccounts) => {
	const provider = (await detectEthereumProvider()) as provider;
	// If the provider returned by detectEthereumProvider is not the same as
	// window.ethereum, something is overwriting it, perhaps another wallet.
	if (provider && provider === ethereum) {
		registerEventListeners(setAlertOpen, setWalletText, setAccounts);
		const web3 = new Web3(provider);
		try {
			// Request account access if needed
			// Interface EthereumProvider is not an exported member
			// so can't extend it with interface merging to add request()
			await (ethereum as any).request({ method: 'eth_requestAccounts' });
			// Accounts now exposed
			resolve(web3);
		} catch (error) {
			const typedError = error as Error;
			printError(typedError.message, typedError.stack as string);
			reject(typedError);
		}
	} else {
		if (!provider) reject(new Error('Could not connect wallet'));
		if (provider !== ethereum) reject(new Error('Do you have multiple wallets installed?'));
	}
};

// Could be extended to connect wallets other than MetaMask
const connectToWalletAsync: (
	resolve: Resolve,
	reject: Reject,
	setAlertOpen: SetAlertOpen,
	setWalletText: React.Dispatch<React.SetStateAction<string>>,
	setAccounts: React.Dispatch<React.SetStateAction<string[] | undefined>>
) => void = async (resolve, reject, setAlertOpen, setWalletText, setAccounts) => {
	connectToMetaMaskAsync(resolve, reject, setAlertOpen, setWalletText, setAccounts);
};

// Get web3 instance
const getWeb3Async: (
	setAlertOpen: SetAlertOpen,
	setWalletText: React.Dispatch<React.SetStateAction<string>>,
	setAccounts: React.Dispatch<React.SetStateAction<string[] | undefined>>
) => Promise<Web3> = async (setAlertOpen, setWalletText, setAccounts) =>
	new Promise<Web3>((resolve, reject) => {
		connectToWalletAsync(resolve, reject, setAlertOpen, setWalletText, setAccounts);
	});

// Get accounts, web3 and contract instances
export const getWeb3ResultAsync: (
	setOpenAlert: React.Dispatch<React.SetStateAction<boolean>>,
	setWalletText: React.Dispatch<React.SetStateAction<string>>,
	setAccounts: React.Dispatch<React.SetStateAction<string[] | undefined>>
) => Promise<Web3Result | null> = async (setOpenAlert, setWalletText, setAccounts) => {
	try {
		// Get network provider and web3 instance
		const web3 = await getWeb3Async(setOpenAlert, setWalletText, setAccounts);
		// Get network info
		const networkId = await web3.eth.net.getId();
		const deployedNetwork = (TestContract as ContractJson).networks[networkId];

		// Use web3 to get the user's accounts
		const accounts = await web3.eth.getAccounts();
		if (accounts.length === 0 || accounts[0] === '') {
			setOpenAlert(true);
		}
		// Get the contract instance
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
export const reconnectWalletAsync: () => void = async () => {
	await (ethereum as any)?.request({
		method: 'wallet_requestPermissions',
		params: [
			{
				eth_accounts: {},
			},
		],
	});
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
	// Minimum ABI to get ERC20 Lumerin Token balance and number of decimals
	const minABI: AbiItem[] = [
		// balanceOf()
		{
			constant: true,
			inputs: [{ name: '_owner', type: 'address' }],
			name: 'balanceOf',
			outputs: [{ name: 'balance', type: 'uint256' }],
			type: 'function',
		},
		// decimals()
		{
			constant: true,
			inputs: [],
			name: 'decimals',
			outputs: [
				{
					internalType: 'uint8',
					name: '',
					type: 'uint8',
				},
			],
			stateMutability: 'view',
			type: 'function',
		},
	];
	const lumerinContract = new web3.eth.Contract(minABI, lumerinTokenAddress);
	try {
		const lumerinBalanceNoDecimals: string = await lumerinContract.methods.balanceOf(userAccount).call();
		const numOfDecimals: string = await lumerinContract.methods.decimals().call();
		return parseInt(lumerinBalanceNoDecimals) / 10 ** parseInt(numOfDecimals);
	} catch (error) {
		const typedError = error as Error;
		printError(typedError.message, typedError.stack as string);
		return null;
	}
};