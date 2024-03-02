import { HistoryentryResponse } from 'contracts-js/dist/generated-types/Implementation';
import { EthereumGateway } from './gateway/ethereum';
import { HashRentalContract } from './types';
import { printError } from './utils';

// Contracts setup
export const loadContract = async (
	web3Gateway: EthereumGateway,
	address: string,
	userAccount: string
): Promise<HashRentalContract> => {
	const data = await web3Gateway.getContract(address);

	let buyerHistory: (HistoryentryResponse & { id: string })[] = [];
	if (localStorage.getItem(address)) {
		const history = await web3Gateway.getContractHistory(address, 0, 100);
		buyerHistory = history
			.filter((entry) => entry._buyer === userAccount)
			.map((entry) => ({ ...entry, id: address }));
	}

	return {
		id: address,
		price: data.price,
		speed: data.speed,
		length: data.length,
		buyer: data.buyer,
		seller: data.seller,
		timestamp: data.timestamp,
		state: data.state,
		encryptedPoolData: data.encryptedPoolData,
		version: data.version,
		isDeleted: data.isDeleted,
		history: buyerHistory,
	};
};

const loadContracts = async (
	web3Gateway: EthereumGateway,
	addresses: string[],
	userAccount: string,
	updateByChunks = false
): Promise<HashRentalContract[]> => {
	const chunkSize = updateByChunks ? 10 : addresses.length;
	let newContracts = [];
	for (let i = 0; i < addresses.length; i += chunkSize) {
		const chunk = addresses.slice(i, i + chunkSize);
		const hashRentalContracts = (
			await Promise.all(
				chunk.map(async (address) => await loadContract(web3Gateway, address, userAccount))
			)
		).filter((c: any) => !c?.isDeleted);
		newContracts.push(...hashRentalContracts);
	}

	return newContracts as HashRentalContract[];
};

export const fetchContracts = async (
	web3Gateway: EthereumGateway,
	userAccount: string,
	updateByChunks = false
): Promise<HashRentalContract[]> => {
	try {
		console.log('Fetching contract list...');

		if (!web3Gateway) {
			console.error('Missing web3 gateway instance');
			return [];
		}

		let addresses: string[] = [];
		try {
			addresses = await web3Gateway.getContracts();
		} catch (error) {
			console.log('Error when trying get list of contracts', error);
			return [];
		}

		console.log('contract addresses: ', addresses);
		return loadContracts(web3Gateway, addresses, userAccount, updateByChunks);
	} catch (error) {
		const typedError = error as Error;
		printError(typedError.message, typedError.stack as string);
		// crash app if can't communicate with webfacing contract
		throw typedError;
	}
};

export const fetchContract = (
	web3Gateway: EthereumGateway,
	userAccount: string,
	contractId: string
): Promise<HashRentalContract[]> => {
	return loadContracts(web3Gateway, [contractId], userAccount, false);
};
