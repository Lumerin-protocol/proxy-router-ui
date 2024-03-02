/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import {
	LMRDecimalToLMR,
	addLumerinTokenToMetaMaskAsync,
} from './web3/helpers';
import {
	HashRentalContract,
	CurrentTab,
	ContractState,
} from './types';

import { Main } from './Main';
import ReactGA from 'react-ga4';
import { useWindowWidth } from './hooks/useWindowWidth';
import { watchAccount } from '@wagmi/core';
import { Config, useAccount, useInfiniteReadContracts, useReadContract } from 'wagmi';
import { erc20Abi } from 'viem';
import { useQueryClient } from '@tanstack/react-query';
import { CloneFactoryAbi } from './contracts/clonefactory';
import { ImplementationAbi } from './contracts/implementation';

const trackingId = 'G-TN08K48RMS';
ReactGA.initialize(trackingId);

interface ContractEntry {
	id: string
	state: number,
	price: bigint,
	length: bigint,
	profitTarget: number
	speed: bigint
	version: number
	startingBlockTimestamp: bigint
	buyer: string
	seller: string
	encryptedPoolData: string
	isDeleted: boolean
	balance: bigint
	hasFutureTerms: boolean
	history: readonly {
		_goodCloseout: boolean;
    _purchaseTime: bigint;
    _endTime: bigint;
    _price: bigint;
    _speed: bigint;
    _length: bigint;
    _buyer: `0x${string}`;
	}[]
}

// Root contains the main state and logic for the app
export const App = (props: {config: Config}) => {
	const [contracts, setContracts] = useState<ContractEntry[]>([]);
	const [currentBlockTimestamp, setCurrentBlockTimestamp] = useState<number>(0);

	const [alertOpen, setAlertOpen] = useState<boolean>(false);
	const [activeOrdersTab, setActiveOrdersTab] = useState<CurrentTab>(CurrentTab.Running);

	const [isMetaMask, setIsMetaMask] = useState<boolean>(false);
	const [pathName, setPathname] = useState<string>('/');

	const [page, setPage] = useState<number>(0);

	const width = useWindowWidth();
	const isMobile = width <= 768;

	// watches account changes
	useEffect(() => {
		watchAccount(props.config,
			{
				onChange(account) {
				}
			}
		)
	}, [])

	const queryClient = useQueryClient();
	const { address: userAccount, isConnected, connector } = useAccount()

	const lmrBalanceResult = useReadContract({
		abi: erc20Abi, 
		address: process.env.REACT_APP_LUMERIN_TOKEN_ADDRESS as `0x${string}`,
		functionName: 'balanceOf',
		args: [userAccount as `0x${string}`],
		query: {
			refetchInterval: 60*1000,
		}
	});

	const getContractListResult = useReadContract({
		abi: CloneFactoryAbi,
		address: process.env.REACT_APP_CLONE_FACTORY as `0x${string}`,
		functionName: 'getContractList',
		args: [],
		query: {
			refetchInterval: 60*1000,
		}
	});
	
	const lumerinBalance = lmrBalanceResult.data !== undefined ? LMRDecimalToLMR(lmrBalanceResult.data) : null;
	const contractIds = getContractListResult !== undefined ? getContractListResult.data : null;
	const currentContractId = contractIds ? contractIds[page] : "0x0";

	const contractResult = useReadContract({
			abi: ImplementationAbi,
			address: currentContractId,
			functionName: 'getPublicVariablesV2',
			args: [],
			scopeKey: currentContractId,
		query: {
			enabled: !!contractIds,
		},
	})

	// TODO: implement with infinite read contracts
	// useInfiniteReadContracts({
	// 	cacheKey: 'contracts',
	// 	contracts(pageParam){
	// 	}
	// })
	const historyResult = useReadContract({
		abi: ImplementationAbi,
		address: currentContractId,
		functionName: 'getHistory',
		args: [BigInt(0), BigInt(100)],
		scopeKey: `${currentContractId}-history`,
		query: {
			enabled: !!contractIds,
		},
	})

	useEffect(() => {
		if (contractResult.data && historyResult.data) {
			console.log("loaded contract", currentContractId)
			const data = contractResult.data;
			const contractEntry: ContractEntry = {
				id: currentContractId,
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
				history: historyResult.data,
			}

			setContracts([...contracts, contractEntry])
			setPage(page + 1);
		}

		return;
	}, [contractResult.isLoading, historyResult.isLoading, page])

	const filteredContracts = contracts.filter((c) => !c.isDeleted);

	const refreshContracts = () => {
		queryClient.invalidateQueries({
			predicate: (query) => {
				console.log(query)
				return true
			}
		});
		setPage(0);
	}

	const setRefreshContracts = (shouldRefresh: boolean) => {
		// should enable or disable the interval refetching
	}

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
			lumerinBalance={lumerinBalance}
			connectorIconUrl={connector?.icon}
			isMetamask={isMetaMask}
			isMobile={isMobile}
			activeOrdersTab={activeOrdersTab}
			setActiveOrdersTab={setActiveOrdersTab}
			setAlertOpen={setAlertOpen}
			getAlertMessage={() => ""}
			pathName={pathName}
			setPathName={setPathname}
			connectWallet={()=>{}}
			changeNetworkAsync={()=>{}}
			addLumerinTokenToMetaMaskAsync={addLumerinTokenToMetaMaskAsync}
			refreshContracts={refreshContracts}
		/>
	);
};

function mapContractEntry(contract: ContractEntry): HashRentalContract  {
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
				_goodCloseout: h._goodCloseout,
				_purchaseTime: String(h._purchaseTime),
				_endTime: String(h._endTime),
				_price: String(h._price),
				_speed: String(h._speed),
				_length: String(h._length),
				_buyer: h._buyer,
			}
		})
	}
}
