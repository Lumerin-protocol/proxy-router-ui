import Web3 from 'web3';
import WalletConnectProvider from '@walletconnect/web3-provider';
import detectEthereumProvider from '@metamask/detect-provider';
import { ethers } from 'ethers';
import { AbiItem } from 'web3-utils';
import { Contract } from 'web3-eth-contract';
import { provider } from 'web3-core/types/index';
import { Dispatch, SetStateAction } from 'react';
import { CloneFactoryContract as CloneFactory, LumerinContract } from 'contracts-js';

import lumerin from '../images/lumerin_metamask.png';
import { printError } from '../utils';
import { ConnectInfo, Ethereum, Receipt, WalletText } from '../types';

interface Web3Result {
	accounts: string[];
	contractInstance: Contract;
	web3: Web3;
	web3ReadOnly?: Web3;
}

const ethereum = window.ethereum as any;
//const lumerinTokenAddress = '0xC6a30Bc2e1D7D9e9FFa5b45a21b6bDCBc109aE1B'; Legacy as of 6/21 - MAY
//const lumerinTokenAddress = '0xD40A8CA6a45994C03a1c134e846f27feeeBf0B5b'; Legacy to ropsten
const lumerinTokenAddress = process.env.REACT_APP_LUMERIN_TOKEN_ADDRESS; //gorli token

// Web3 setup helpers
const getProviderAsync: (walletName: string) => Promise<any> = async (walletName) => {
	switch (walletName) {
		case WalletText.ConnectViaMetaMask:
			console.log('Using MetaMask');
			const provider = await detectEthereumProvider();
			return provider;
		default:
			console.log('Using WalletConnect');
			console.log('process.env.REACT_APP_CHAIN_ID: ' + process.env.REACT_APP_CHAIN_ID);

			return new WalletConnectProvider({
				chainId: parseInt(process.env.REACT_APP_CHAIN_ID!),
				clientMeta: {
					description:
						'Welcome to the Lumerin Token Distribution site. Claim your LMR tokens here.',
					url: 'https://token.sbx.lumerin.io',
					icons: [''],
					name: 'Lumerin Token Distribution',
				},
			});
	}
};

export const getAlchemyNodeUrl = () => {
	const alchemyApiKey = process.env.REACT_APP_ETH_NODE_API_KEY;
	if (!alchemyApiKey) {
		return null;
	}
	const chainId = process.env.REACT_APP_CHAIN_ID;
	let chainString = '';
	if (chainId === '421614') {
		chainString = 'sepolia';
	} else if (chainId === '42161') {
		chainString = 'mainnet';
	} else {
		return null;
	}
	return `https://arb-${chainString}.g.alchemy.com/v2/${alchemyApiKey}`;
};

// Get accounts, web3 and contract instances
export const getWeb3ResultAsync = async (
	onConnect: (info: ConnectInfo) => void,
	onDisconnect: (err: Error) => void,
	onChainChange: (chainId: string, pr: provider) => void,
	onAccountsChange: (accounts: string[]) => void,
	walletName: string
): Promise<Web3Result | null> => {
	try {
		const provider = await getProviderAsync(walletName);

		if (!provider) {
			console.error('Missing provider');
			return null;
		}

		if (typeof provider === 'string') {
			console.error('Invalid string provider', provider);
			return null;
		}

		if (walletName === WalletText.ConnectViaMetaMask) {
			ethereum.on('connect', onConnect);
			ethereum.on('disconnect', onDisconnect);
			ethereum.on('chainChanged', (chainID: string) => onChainChange(chainID, ethereum));
			ethereum.on('accountsChanged', onAccountsChange);
			await ethereum.request({ method: 'eth_requestAccounts' });
		} else {
			provider.on('disconnect', onDisconnect);
			provider.on('chainChanged', onChainChange);
			provider.on('accountsChanged', onAccountsChange);
			await WalletConnectProvider.enable();
		}

		const web3 = new Web3(provider as provider);
		const accounts = await web3.eth.getAccounts();

		const nodeUrl = getAlchemyNodeUrl();
		let web3ReadOnly;
		if (nodeUrl) {
			web3ReadOnly = new Web3(getAlchemyNodeUrl());
		}
		const cloneFactoryInstance = new web3.eth.Contract(
			CloneFactory.abi as AbiItem[],
			process.env.REACT_APP_CLONE_FACTORY
		);

		return { accounts, contractInstance: cloneFactoryInstance, web3, web3ReadOnly };
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

export const disconnectWalletConnectAsync: (
	isMetaMask: boolean,
	web3: Web3,
	setIsConnected: Dispatch<SetStateAction<boolean>>
) => void = async (isMetaMask, web3, setIsConnected) => {
	if (!isMetaMask) {
		await (web3?.currentProvider as unknown as WalletConnectProvider)?.disconnect();
		setIsConnected(false);
		localStorage.clear();
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

export const getLumerinTokenBalanceAsync = async (
	web3: Web3,
	userAccount: string
): Promise<number | null> => {
	const lumerinContractInstance = new web3.eth.Contract(
		LumerinContract.abi as AbiItem[],
		lumerinTokenAddress
	);

	try {
		const lumerinBalance: string = await lumerinContractInstance.methods
			.balanceOf(userAccount)
			.call();
		return divideByDigits(parseInt(lumerinBalance));
	} catch (error) {
		const typedError = error as Error;
		printError(typedError.message, typedError.stack as string);
		return null;
	}
};

export const transferLumerinAsync: (
	web3: Web3,
	userAccount: string,
	sellerAccount: string,
	amount: number
) => Promise<Receipt> = async (web3, userAccount, sellerAccount, amount) => {
	const lumerinContractInstance = new web3.eth.Contract(
		LumerinContract.abi as AbiItem[],
		lumerinTokenAddress
	);
	return await lumerinContractInstance.methods
		.transfer(sellerAccount, multiplyByDigits(amount))
		.send({ from: userAccount, gas: 1000000 });
};

export const multiplyByDigits: (amount: number) => number = (amount) => {
	return amount * 10 ** 8;
};

export const divideByDigits: (amount: number) => number = (amount) => {
	if (amount < 1000) return amount;
	return parseInt(String(amount / 10 ** 8));
};

export const getGasConfig = () => {
	const chainId = process.env.REACT_APP_CHAIN_ID;
	if (chainId === '421614' || chainId === '42161') {
		// no priority fee on Arbitrum, maxFeePerGas is stable at 0.1 gwei
		return {
			maxPriorityFeePerGas: ethers.utils.parseUnits('0', 'gwei'),
			maxFeePerGas: ethers.utils.parseUnits('0.1', 'gwei'),
		};
	}
	return {};
};
