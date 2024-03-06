import lumerin from '../images/lumerin_metamask.png';
import { printError } from '../utils';

const ethereum = (window as any).ethereum;

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

export const LMRDecimalToLMR = (decimal: number | string | bigint): number => {
	const big = typeof decimal === 'bigint' ? decimal : BigInt(decimal);
	const resultBig = big / BigInt(10 ** LMRDecimal);
	return Number(resultBig);
};

// Convert integer provided as number, BigInt or decimal string to hex string with prefix '0x'
export const intToHex = (value: number | BigInt | string) => {
	if (typeof value === 'string') {
		value = Number(value);
	}
	return '0x' + value.toString(16);
};
