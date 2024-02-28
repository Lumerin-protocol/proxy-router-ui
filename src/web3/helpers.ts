import Web3 from 'web3';
import WalletConnectProvider from '@walletconnect/web3-provider';
import detectEthereumProvider from '@metamask/detect-provider';
import { AbiItem } from 'web3-utils';
import { Contract } from 'web3-eth-contract';
import { provider } from 'web3-core/types/index';
import { Dispatch, SetStateAction } from 'react';
import { CloneFactoryContract as CloneFactory, LumerinContract } from 'contracts-js';

import lumerin from '../images/lumerin_metamask.png';
import { printError } from '../utils';
import { ConnectInfo, Ethereum, Receipt, WalletText } from '../types';
import { EthereumGateway } from '../gateway/ethereum';

interface Web3Result {
	accounts: string[];
	contractInstance: Contract;
	web3: Web3;
	web3Gateway: EthereumGateway;
}

const ethereum = window.ethereum as Ethereum;
const lumerinTokenAddress = process.env.REACT_APP_LUMERIN_TOKEN_ADDRESS; //gorli token

// Web3 setup helpers
const getProviderAsync: (walletName: string) => Promise<Ethereum | WalletConnectProvider> = async (
	walletName
) => {
	switch (walletName) {
		case WalletText.ConnectViaMetaMask:
			console.log('Using MetaMask');
			const provider = await detectEthereumProvider();
			return provider as Ethereum;
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

		const contractInstance = new web3.eth.Contract(
			CloneFactory.abi as AbiItem[],
			process.env.REACT_APP_CLONE_FACTORY
		);

		const web3Gateway = new EthereumGateway(web3, process.env.REACT_APP_CLONE_FACTORY!)

		return { accounts, contractInstance, web3, web3Gateway };
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

export const multiplyByDigits: (amount: number) => number = (amount) => {
	return amount * 10 ** 8;
};

export const divideByDigits: (amount: number) => number = (amount) => {
	return parseInt(String(amount / 10 ** 8));
};

const LMRDecimal = 8;

export const LMRDecimalToLMR = (decimal: number|string): number => {
	const big = BigInt(decimal) / BigInt(10 ** LMRDecimal);
	return Number(big);
} 

// Convert integer provided as number, BigInt or decimal string to hex string with prefix '0x'
export const intToHex = (value: number | BigInt | string) => {
	if (typeof value === 'string') {
		value = Number(value);
	}
	return '0x' + value.toString(16);
}