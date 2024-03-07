import { Client, erc20Abi } from 'viem';
import {
	UseWriteContractParameters,
	useReadContract,
	useWaitForTransactionReceipt,
	useWriteContract,
} from 'wagmi';
import { QueryParameter } from 'wagmi/dist/types/types/properties';
import { CloneFactoryAbi } from '../contracts/clonefactory';
import { LMRDecimalToLMR } from '../web3/helpers';
import { ImplementationAbi } from '../contracts/implementation';
import { encryptMessage, pubKeyToAddress } from '../utils';
import { readContract, waitForTransactionReceipt, writeContract } from 'viem/actions';
import { UseQueryResult, useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { IndexerContractEntry } from './interfaces';
import { UseQueryParameters } from 'wagmi/dist/types/utils/query';

interface Params extends QueryParameter {
	scopeKey?: string;
}

export const useLmrBalance = (props: { address: string | `0x${string}` } & Params) => {
	const { data, ...rest } = useReadContract({
		abi: erc20Abi,
		address: process.env.REACT_APP_LUMERIN_TOKEN_ADDRESS as `0x${string}`,
		functionName: 'balanceOf',
		args: [props.address as `0x${string}`],
		query: props.query as any,
	});

	const d =
		data !== undefined
			? {
					balance: LMRDecimalToLMR(data),
					balanceDecimal: data,
			  }
			: undefined;

	return {
		...rest,
		data: d,
	};
};

export const useContracts = (props: {
	walletAddr: string;
	query: UseQueryParameters;
}): UseQueryResult<IndexerContractEntry[]> => {
	return useQuery({
		...(props.query as any),
		queryFn: async () => {
			console.log('refetching contracts');
			const url = new URL('/api/contracts', process.env.REACT_APP_CONTRACT_INDEXER_URL);
			url.searchParams.append('walletAddr', props.walletAddr);
			const data = await fetch(url);
			const json = (await data.json()) as IndexerContractEntry[];

			return json.sort((a, b) => {
				return Number(a.stats.successCount) - Number(b.stats.successCount);
			});
		},
	});
};

export const useContractList = (props: Params) => {
	return useReadContract({
		abi: CloneFactoryAbi,
		address: process.env.REACT_APP_CLONE_FACTORY as `0x${string}`,
		functionName: 'getContractList',
		args: [],
		query: props.query as any,
	});
};

interface ReactQuery {
	refetchInterval?: number;
	enabled?: boolean;
}

export const useInfiniteContracts = (client: Client, contractIds: string[], query: ReactQuery) => {
	return useInfiniteQuery({
		...query,
		enabled: contractIds.length > 0,
		queryFn: async ({ pageParam, meta }) => {
			const contractId = contractIds[pageParam];
			const contract = await readContract(client!, {
				abi: ImplementationAbi,
				address: contractId as `0x${string}`,
				functionName: 'getPublicVariablesV2',
				args: [],
			});
			console.log('fetching', contractId);

			meta = { custom: contractId } as any;

			const history = await readContract(client!, {
				abi: ImplementationAbi,
				address: contractId as `0x${string}`,
				functionName: 'getHistory',
				args: [BigInt(0), BigInt(100)],
			});

			return {
				id: contractId,
				state: contract[0],
				price: contract[1]._price,
				length: contract[1]._length,
				profitTarget: contract[1]._profitTarget,
				speed: contract[1]._speed,
				version: contract[1]._version,
				startingBlockTimestamp: contract[2],
				buyer: contract[3],
				seller: contract[4],
				encryptedPoolData: contract[5],
				isDeleted: contract[6],
				balance: contract[7],
				hasFutureTerms: contract[8],
				history: history.map((d) => ({
					goodCloseout: d._goodCloseout,
					purchaseTime: d._purchaseTime,
					endTime: d._endTime,
					price: d._price,
					speed: d._speed,
					length: d._length,
					buyer: d._buyer,
				})),
			};
		},
		getNextPageParam: (lastPage, allPages, lastPageParam) => {
			if (lastPageParam >= contractIds.length - 1) {
				return undefined;
			}
			return lastPageParam + 1;
		},
		queryKey: ['get-contracts'],
		staleTime: 60 * 1000,
		refetchOnWindowFocus: false,

		initialPageParam: 0,
	});
};

export const useContract = (props: { address: string | `0x${string}` } & Params) => {
	const { data, ...rest } = useReadContract({
		abi: ImplementationAbi,
		address: props.address as `0x${string}`,
		functionName: 'getPublicVariablesV2',
		args: [],
		query: props.query as any,
	});

	const d = data
		? {
				id: props.address,
				state: data[0],
				price: data[1]._price,
				length: data[1]._length,
				profitTarget: data[1]._profitTarget,
				speed: data[1]._speed,
				version: data[1]._version,
				startingBlockTimestamp: data[2],
				buyer: data[3],
				seller: data[4],
				encryptedPoolData: data[5],
				isDeleted: data[6],
				balance: data[7],
				hasFutureTerms: data[8],
		  }
		: undefined;

	return { ...rest, data: d };
};

export const useContractHistory = (
	props: { address: string | `0x${string}`; offset: number; limit: number } & Params
) => {
	const { data, ...rest } = useReadContract({
		abi: ImplementationAbi,
		address: props.address as `0x${string}`,
		functionName: 'getHistory',
		args: [BigInt(props.offset), BigInt(props.limit)],
		scopeKey: props.scopeKey,
		query: props.query as any,
	});

	const d = data
		? data.map((d) => ({
				buyer: d._buyer,
				price: d._price,
				length: d._length,
				speed: d._speed,
				goodCloseout: d._goodCloseout,
				purchaseTime: d._purchaseTime,
				endTime: d._endTime,
		  }))
		: undefined;

	return {
		...rest,
		data: d,
	};
};

interface PurchaseContractParams {
	contractAddress: string;
	validatorPublicKey: string;
	validatorURL: string;
	destURL: string;
	termsVersion: number;
	price: bigint;
}

const txWaitTimeout = 60 * 1000;

export const purchaseContract = async (client: Client, params: PurchaseContractParams) => {
	// const client = useClient();
	// if (!client) {
	// 	console.error('Client not ready yet');
	// 	return
	// }

	const sellerPubKey = await readContract(client, {
		abi: ImplementationAbi,
		address: params.contractAddress as `0x${string}`,
		functionName: 'pubKey',
		args: [],
	});

	const fee = await readContract(client, {
		abi: CloneFactoryAbi,
		address: process.env.REACT_APP_CLONE_FACTORY as `0x${string}`,
		functionName: 'marketplaceFee',
		args: [],
	});

	const approveTxId = await writeContract(client, {
		abi: erc20Abi,
		account: client.account!,
		chain: client.chain,
		address: process.env.REACT_APP_LUMERIN_TOKEN_ADDRESS as `0x${string}`,
		functionName: 'approve',
		args: [process.env.REACT_APP_CLONE_FACTORY as `0x${string}`, params.price],
	});

	const approveTx = await waitForTransactionReceipt(client, {
		hash: approveTxId,
		timeout: txWaitTimeout,
	});

	if (approveTx.status === 'reverted') {
		throw new Error('Approve transaction reverted');
	}

	const purchaseTxId = await writeContract(client, {
		abi: CloneFactoryAbi,
		account: client.account!,
		chain: client.chain,
		address: process.env.REACT_APP_CLONE_FACTORY as `0x${string}`,
		functionName: 'setPurchaseRentalContractV2',
		args: [
			params.contractAddress as `0x${string}`,
			pubKeyToAddress(params.validatorPublicKey) as `0x${string}`,
			(await encryptMessage(params.validatorPublicKey.slice(2), params.destURL)).toString('hex'),
			(await encryptMessage(`04${sellerPubKey}`, params.validatorURL)).toString('hex'),
			params.termsVersion,
		],
		value: fee,
	});

	const purchaseTx = await waitForTransactionReceipt(client, {
		hash: purchaseTxId,
		timeout: txWaitTimeout,
	});

	if (purchaseTx.status === 'reverted') {
		throw new Error('Purchase transaction reverted');
	}
};

export const usePurchaseContract = (
	params: UseWriteContractParameters & PurchaseContractParams
) => {
	const sellerPubKey = useReadContract({
		abi: ImplementationAbi,
		address: params.contractAddress as `0x${string}`,
		functionName: 'pubKey',
		args: [],
		query: {
			staleTime: Infinity, // value that will never change for particular contract
		},
	});

	const marketplaceFee = useReadContract({
		abi: CloneFactoryAbi,
		address: process.env.REACT_APP_CLONE_FACTORY as `0x${string}`,
		functionName: 'marketplaceFee',
		args: [],
		query: {
			staleTime: 60 * 60 * 1000, // value that will likely never won't change within a page load
		},
	});

	const approveTx = useWriteContract();
	const approveTxReceipt = useWaitForTransactionReceipt({
		hash: approveTx.data,
		timeout: txWaitTimeout,
	});
	const purchaseTx = useWriteContract();
	const purchaseTxReceipt = useWaitForTransactionReceipt({
		hash: purchaseTx.data,
		timeout: txWaitTimeout,
	});

	useEffect(() => {
		async function purchase() {
			purchaseTx.writeContract({
				abi: CloneFactoryAbi,
				address: process.env.REACT_APP_CLONE_FACTORY as `0x${string}`,
				functionName: 'setPurchaseRentalContractV2',
				args: [
					params.contractAddress as `0x${string}`,
					pubKeyToAddress(params.validatorPublicKey) as `0x${string}`,
					(await encryptMessage(params.validatorPublicKey.slice(2), params.destURL)).toString(
						'hex'
					),
					(await encryptMessage(`04${sellerPubKey.data}`, params.validatorURL)).toString('hex'),
					params.termsVersion,
				],
				value: marketplaceFee.data,
			});
		}
		if (approveTxReceipt.data?.status === 'success') {
			console.log('APPROVED', approveTxReceipt.data);
			purchase();
		}
	}, [approveTxReceipt.data?.status]);

	const execute = async () => {
		console.log('Executing purchase contract');
		if (!approveTx.isIdle || !purchaseTx.isIdle) {
			console.log('current purchase not finished yet');
			return;
		}

		if (!sellerPubKey.isFetched) {
			console.error('Seller public key not fetched yet');
			return;
		}

		if (!marketplaceFee.isFetched) {
			console.error('Marketplace fee not fetched yet');
			return;
		}

		approveTx.writeContract({
			address: process.env.REACT_APP_LUMERIN_TOKEN_ADDRESS as `0x${string}`,
			abi: erc20Abi,
			functionName: 'approve',
			args: [process.env.REACT_APP_CLONE_FACTORY as `0x${string}`, params.price],
		});

		return;
	};

	return {
		sellerPubKey,
		marketplaceFee,
		approveTx,
		purchaseTx,
		purchaseTxReceipt,
		execute,
		reset: () => {
			approveTx.reset();
			purchaseTx.reset();
		},
	};
};
