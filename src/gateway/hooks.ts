import { QueryKey } from '@tanstack/react-query';
import { erc20Abi } from 'viem';
import { useReadContract } from 'wagmi';
import { QueryParameter } from 'wagmi/dist/types/types/properties';
import { CloneFactoryAbi } from '../contracts/clonefactory';
import { LMRDecimalToLMR } from '../web3/helpers';
import { ImplementationAbi } from '../contracts/implementation';

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

	const d = data
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

export const useContractList = (props: Params) => {
	return useReadContract({
		abi: CloneFactoryAbi,
		address: process.env.REACT_APP_CLONE_FACTORY as `0x${string}`,
		functionName: 'getContractList',
		args: [],
		query: props.query as any,
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
