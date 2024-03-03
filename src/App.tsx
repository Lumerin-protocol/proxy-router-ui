import { useEffect, useState } from 'react';
import { addLumerinTokenToMetaMaskAsync } from './web3/helpers';
import { HashRentalContract, CurrentTab, ContractState } from './types';
import { Main } from './Main';
import ReactGA from 'react-ga4';
import { useWindowWidth } from './hooks/useWindowWidth';
import { watchAccount } from '@wagmi/core';
import { Config, useAccount } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import { useContract, useContractHistory, useContractList, useLmrBalance } from './gateway/hooks';

const trackingId = 'G-TN08K48RMS';
ReactGA.initialize(trackingId);

interface ContractEntry {
	id: string;
	state: number;
	price: bigint;
	length: bigint;
	profitTarget: number;
	speed: bigint;
	version: number;
	startingBlockTimestamp: bigint;
	buyer: string;
	seller: string;
	encryptedPoolData: string;
	isDeleted: boolean;
	balance: bigint;
	hasFutureTerms: boolean;
	history: readonly {
		goodCloseout: boolean;
		purchaseTime: bigint;
		endTime: bigint;
		price: bigint;
		speed: bigint;
		length: bigint;
		buyer: `0x${string}`;
	}[];
}

const RefetchInterval = 30 * 1000;

// Root contains the main state and logic for the app
export const App = (props: { config: Config }) => {
	const [contracts, setContracts] = useState<ContractEntry[]>([]);
	const [currentBlockTimestamp, setCurrentBlockTimestamp] = useState<number>(0);

	const [alertOpen, setAlertOpen] = useState<boolean>(false);
	const [activeOrdersTab, setActiveOrdersTab] = useState<CurrentTab>(CurrentTab.Running);

	const [isMetaMask, setIsMetaMask] = useState<boolean>(false);
	const [pathName, setPathname] = useState<string>('/');

	const [page, setPage] = useState<number>(0); // contract pagination
	const [isRefetching, setIsRefetching] = useState<boolean>(true); // background refetching contract list

	const width = useWindowWidth();
	const isMobile = width <= 768;

	// watches account changes
	useEffect(() => {
		watchAccount(props.config, {
			onChange(account) {},
		});
	}, []);

	const queryClient = useQueryClient();
	const { address: userAccount, isConnected, connector } = useAccount();

	// TODO: replace with multicall lmrBalanceResult and getContractListResult
	const lmrBalanceResult = useLmrBalance({
		address: userAccount as string,
		query: {
			refetchInterval: RefetchInterval,
			enabled: isRefetching,
		},
	});
	const getContractListResult = useContractList({
		query: {
			refetchInterval: RefetchInterval,
			enabled: isRefetching,
		},
	});

	const contractIds = getContractListResult !== undefined ? getContractListResult.data : null;
	const currentContractId = contractIds ? contractIds[page] : '0x0';

	const contractResult = useContract({
		address: currentContractId,
		query: {
			enabled: !!contractIds,
		},
	});

	const historyResult = useContractHistory({
		address: currentContractId,
		offset: 0,
		limit: 100,
		scopeKey: `${currentContractId}-history`,
		query: {
			enabled: !!contractIds,
		},
	});

	// pagination, currently just loads the next contract
	useEffect(() => {
		if (contractResult.data && historyResult.data) {
			const { data } = contractResult;

			const contractEntry: ContractEntry = {
				...data,
				history: historyResult.data,
			};
			if (!contractEntry.isDeleted) {
				setContracts([...contracts, contractEntry]);
			}
			setPage(page + 1);
		}
		return;
	}, [contractResult.isLoading, historyResult.isLoading, page]);

	// forcefully refetch all contracts
	const refreshContracts = () => {
		queryClient.invalidateQueries({
			predicate: (query) => {
				console.log(query);
				return true;
			},
		});
		setPage(0);
	};

	// enable / disable background refetching
	const setRefreshContracts = (shouldRefresh: boolean) => {
		console.log(`refetching contracts ${shouldRefresh}, was ${isRefetching}`);
		setIsRefetching(shouldRefresh);
	};

	useEffect(() => {
		setPathname(window.location.pathname);
	}, [window.location.pathname]);

	return (
		<Main
			isConnected={isConnected}
			alertOpen={alertOpen}
			userAccount={userAccount as string}
			contracts={contracts.map(mapContractEntry)}
			currentBlockTimestamp={currentBlockTimestamp}
			lumerinBalance={lmrBalanceResult.data ? lmrBalanceResult.data.balance : null}
			connectorIconUrl={connector?.icon}
			isMetamask={isMetaMask}
			isMobile={isMobile}
			activeOrdersTab={activeOrdersTab}
			setActiveOrdersTab={setActiveOrdersTab}
			setAlertOpen={setAlertOpen}
			getAlertMessage={() => ''}
			pathName={pathName}
			setPathName={setPathname}
			connectWallet={() => {}}
			changeNetworkAsync={() => {}}
			addLumerinTokenToMetaMaskAsync={addLumerinTokenToMetaMaskAsync}
			refreshContracts={refreshContracts}
		/>
	);
};

// temporary mapping function
function mapContractEntry(contract: ContractEntry): HashRentalContract {
	return {
		id: contract.id,
		state: contract.state === 0 ? ContractState.Available : ContractState.Running,
		price: contract.price.toString(10),
		length: contract.length.toString(10),
		profitTarget: contract.profitTarget,
		speed: contract.speed.toString(10),
		version: String(contract.version),
		timestamp: String(contract.startingBlockTimestamp),
		buyer: contract.buyer,
		seller: contract.seller,
		encryptedPoolData: contract.encryptedPoolData,
		isDeleted: contract.isDeleted,
		balance: String(contract.balance),
		hasFutureTerms: contract.hasFutureTerms,
		history: contract.history.map((h) => {
			return {
				id: contract.id,
				_goodCloseout: h.goodCloseout,
				_purchaseTime: String(h.purchaseTime),
				_endTime: String(h.endTime),
				_price: String(h.price),
				_speed: String(h.speed),
				_length: String(h.length),
				_buyer: h.buyer,
			};
		}),
	};
}
