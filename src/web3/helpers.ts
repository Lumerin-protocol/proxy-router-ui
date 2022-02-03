import React from 'react';
import Web3 from 'web3';
import detectEthereumProvider from '@metamask/detect-provider';
import lumerin from '../images/lumerin_metamask.png';
import { AbiItem } from 'web3-utils';
import { Contract } from 'web3-eth-contract';
import { provider } from 'web3-core/types/index';
import { registerEventListeners } from './eventListeners';
import CloneFactory from '../contracts/CloneFactory.json';
import LumerinContract from '../contracts/Lumerin.json';
import { ContractJson, Ethereum, Receipt } from '../types';
import { printError } from '../utils';

interface Web3Result {
	accounts: string[];
	contractInstance: Contract;
	web3: Web3;
}

type Resolve = (web3: Web3) => void;
type Reject = (error: Error) => void;
type SetAlertOpen = React.Dispatch<React.SetStateAction<boolean>>;

const ethereum = window.ethereum as Ethereum;
const lumerinTokenAddress = '0x84E00a18a36dFa31560aC216da1A9bef2164647D';

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
		// TODO: update to mainnet when in production
		// Check connected to correct network
		registerEventListeners(setAlertOpen, setWalletText, setAccounts);
		try {
			// Expose Accounts
			await ethereum.request({ method: 'eth_requestAccounts' });
			const web3 = new Web3(provider);
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
	SetAlertOpen: React.Dispatch<React.SetStateAction<boolean>>,
	setWalletText: React.Dispatch<React.SetStateAction<string>>,
	setAccounts: React.Dispatch<React.SetStateAction<string[] | undefined>>
) => Promise<Web3Result | null> = async (SetAlertOpen, setWalletText, setAccounts) => {
	try {
		const web3 = await getWeb3Async(SetAlertOpen, setWalletText, setAccounts);
		const networkId = await web3.eth.net.getId();
		const deployedNetwork = (CloneFactory as ContractJson).networks[networkId];

		const accounts = await web3.eth.getAccounts();
		if (accounts.length === 0 || accounts[0] === '') {
			SetAlertOpen(true);
		}
		const contractInstance = new web3.eth.Contract(CloneFactory.abi as AbiItem[], deployedNetwork && deployedNetwork.address);
		return { accounts, contractInstance, web3 };
	} catch (error) {
		const typedError = error as Error;
		printError(typedError.message, typedError.stack as string);
		return null;
	}
};

// Wallet helpers
// Allows user choose which account they want to use in MetaMask
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
