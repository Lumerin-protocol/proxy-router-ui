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
		if ((provider as Ethereum).networkVersion !== '3') setAlertOpen(true);
		registerEventListeners(setAlertOpen, setWalletText, setAccounts);
		const web3 = new Web3(provider);
		try {
			// Request account access if needed
			// Interface EthereumProvider is not an exported member
			// so can't extend it with interface merging to add request()
			await ethereum.request({ method: 'eth_requestAccounts' });
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
		// TODO: use below line once off AWS Ganache instance
		const networkId = await web3.eth.net.getId();
		const deployedNetwork = (CloneFactory as ContractJson).networks[networkId];

		// Use web3 to get the user's accounts
		const accounts = await web3.eth.getAccounts();
		if (accounts.length === 0 || accounts[0] === '') {
			setOpenAlert(true);
		}
		// Get the contract instance
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
		const lumerinBalanceNoDecimals: string = await lumerinContractInstance.methods.balanceOf(userAccount).call();
		const lumerinBalanceNoDecimalsBN = web3.utils.toBN(lumerinBalanceNoDecimals);
		const decimalsBN = web3.utils.toBN(8);
		return lumerinBalanceNoDecimalsBN.div(web3.utils.toBN(10).pow(decimalsBN)).toNumber();
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
	const decimalsBN = web3.utils.toBN(8);
	const amountBN = web3.utils.toBN(amount);
	const amountAdjustedForDecimals = amountBN.mul(web3.utils.toBN(10).pow(decimalsBN));
	return await lumerinContractInstance.methods.transfer(sellerAccount, amountAdjustedForDecimals).send({ from: userAccount, gas: 1000000 });
};

export const getContractPrice: (web3: Web3, price: number) => number = (web3, price) => {
	const decimalsBN = web3.utils.toBN(8);
	const priceBN = web3.utils.toBN(price);
	return priceBN.div(web3.utils.toBN(10).pow(decimalsBN)).toNumber();
};
