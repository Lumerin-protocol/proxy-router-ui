import Web3 from 'web3';
import WalletConnectProvider from '@walletconnect/web3-provider';
import detectEthereumProvider from '@metamask/detect-provider';
import { provider } from 'web3-core/types/index';
import { Dispatch, SetStateAction } from 'react';
import lumerin from '../images/lumerin_metamask.png';
import { printError } from '../utils';
import { ConnectInfo, Ethereum, WalletText } from '../types';
import { EthereumGateway } from '../gateway/ethereum';

interface Web3Result {
	accounts: string[];
	web3: Web3;
	web3Gateway: EthereumGateway;
	web3ReadOnly: Web3;
}

const ethereum = window.ethereum as Ethereum;

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

export const getReadonlyNodeURL = () => {
	if (!process.env.REACT_APP_READ_ONLY_ETH_NODE_URL) {
		throw new Error('REACT_APP_READ_ONLY_ETH_NODE_URL is not set');
	}
	return process.env.REACT_APP_READ_ONLY_ETH_NODE_URL;
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

		const web3ReadOnly = new Web3(getReadonlyNodeURL());

		const web3Gateway = new EthereumGateway(
			web3,
			web3ReadOnly,
			process.env.REACT_APP_CLONE_FACTORY!,
			process.env.REACT_APP_INDEXER_URL!
		);
		await web3Gateway.init();

		return { accounts, web3, web3Gateway, web3ReadOnly };
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
					address: process.env.REACT_APP_LUMERIN_TOKEN_ADDRESS,
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
const ETHDecimal = 18;

export const LMRDecimalToLMR = (decimal: number): number => {
	return decimal / 10 ** LMRDecimal;
};

export const ETHDecimalToETH = (decimal: number): number => {
	return decimal / 10 ** ETHDecimal;
};

// Convert integer provided as number, BigInt or decimal string to hex string with prefix '0x'
export const intToHex = (value: number | BigInt | string) => {
	if (typeof value === 'string') {
		value = Number(value);
	}
	return '0x' + value.toString(16);
};

export const formatCurrency: (param: {
	value: number;
	currency: string | undefined;
	maxSignificantFractionDigits: number;
}) => string = ({ value, currency, maxSignificantFractionDigits }) => {
	let style = 'currency';

	if (!currency) {
		currency = undefined;
		style = 'decimal';
	}

	if (maxSignificantFractionDigits == 0) {
		return Math.floor(value).toString();
	}

	if (value < 1) {
		return new Intl.NumberFormat(navigator.language, {
			style: style,
			currency: currency,
			maximumSignificantDigits: 4,
		}).format(value);
	}

	const integerDigits = value.toFixed(0).toString().length;
	let fractionDigits = maxSignificantFractionDigits - integerDigits;
	if (fractionDigits < 0) {
		fractionDigits = 0;
	}

	return new Intl.NumberFormat(navigator.language, {
		style: style,
		currency: currency,
		minimumFractionDigits: fractionDigits,
		maximumFractionDigits: fractionDigits,
	}).format(value);
};
