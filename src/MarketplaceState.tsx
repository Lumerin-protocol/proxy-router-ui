import React from 'react';
import { useEffect, useState } from 'react';
import { HashRentalContract, ContractState } from './types';
import { Router } from './Router';
import { useWindowWidth } from './hooks/useWindowWidth';
import { useAccount, useClient } from 'wagmi';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useContracts, useLmrBalance } from './gateway/hooks';
import { EthereumGateway } from './gateway/ethereum';
import { IndexerContractEntry } from './gateway/interfaces';

const RefetchInterval = 30 * 1000;

// State contains the main state and logic for the app
export const MarketplaceState: React.FC = () => {
	const [isRefetching, setIsRefetching] = useState<boolean>(true); // background refetching of the contract list
	const queryClient = useQueryClient();
	const { address: userAccount, isConnected } = useAccount();
	const client = useClient();
	const [web3Gateway, setWeb3Gateway] = useState<EthereumGateway | null>(null);

	const width = useWindowWidth();
	const isMobile = width <= 768;

	useEffect(() => {
		if (!client) {
			console.log('newclient empty', client);
			return;
		}
		console.log('CONNECTED', client);
		setWeb3Gateway(new EthereumGateway(client, process.env.REACT_APP_CLONE_FACTORY!));
	}, [client?.uid]);

	const web3Init = useQuery({
		queryKey: ['web3-gateway-init'],
		queryFn: async () => {
			await web3Gateway?.init();
			return true;
		},
		enabled: web3Gateway !== null && isConnected,
		staleTime: Infinity,
		refetchOnMount: false,
		refetchOnReconnect: false,
		refetchOnWindowFocus: false,
	});

	// TODO: replace with multicall lmrBalanceResult and getContractListResult
	const lmrBalanceResult = useLmrBalance({
		address: userAccount as string,
		query: {
			refetchInterval: RefetchInterval,
			enabled: isRefetching && isConnected,
		},
	});
	const contractResult = useContracts({
		walletAddr: userAccount as string,
		query: {
			queryKey: ['get-contracts'],
			refetchInterval: RefetchInterval,
			enabled: isRefetching,
		},
	});

	// filter out deleted contracts
	const contracts = contractResult.data?.filter((p) => !p.isDeleted);

	// forcefully refetch all contracts
	const refreshContracts = () => {
		queryClient.invalidateQueries({
			queryKey: ['get-contracts'],
		});
	};

	// enable / disable background refetching
	const setRefreshContracts = (shouldRefresh: boolean) => {
		console.log(`refetching contracts ${shouldRefresh}, was ${isRefetching}`);
		setIsRefetching(shouldRefresh);
	};

	if (web3Init.isError) {
		return <div>error</div>;
	}

	return (
		<Router
			web3Gateway={web3Gateway || undefined}
			userAccount={userAccount as string}
			contracts={contracts?.map(mapContractEntry) || []}
			lumerinBalance={lmrBalanceResult.data ? lmrBalanceResult.data.balance : null}
			isMobile={isMobile}
			refreshContracts={refreshContracts}
		/>
	);
};

// temporary mapping function
function mapContractEntry(contract: IndexerContractEntry): HashRentalContract {
	return {
		id: contract.id,
		state: contract.state === '0' ? ContractState.Available : ContractState.Running,
		price: contract.price,
		length: contract.length,
		profitTarget: Number(contract.profitTarget),
		speed: contract.speed,
		version: contract.version,
		timestamp: contract.startingBlockTimestamp,
		buyer: contract.buyer,
		seller: contract.seller,
		encryptedPoolData: contract.encrValidatorUrl,
		isDeleted: contract.isDeleted,
		balance: contract.balance,
		hasFutureTerms: contract.hasFutureTerms,
		history: contract.history.map((h) => {
			return {
				id: contract.id,
				_goodCloseout: h.isGoodCloseout,
				_purchaseTime: h.purchaseTime,
				_endTime: h.endTime,
				_price: h.price,
				_speed: h.speed,
				_length: h.length,
				_buyer: h.buyer,
			};
		}),
	};
}
