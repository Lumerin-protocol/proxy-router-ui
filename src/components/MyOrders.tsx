import React, {
	Dispatch,
	MouseEventHandler,
	SetStateAction,
	useEffect,
	useMemo,
	useState,
} from 'react';
import { getProgressPercentage, setMediaQueryListOnChangeHandler, sortContracts } from '../utils';

import { ContractState, HashRentalContract, CurrentTab, ContractHistoryData } from '../types';
import { Spinner } from './ui/Spinner.styled';
import { useInterval } from './hooks/useInterval';

import _ from 'lodash';
import { Card, FinishedContracts, PurchasedContracts } from './ui/Cards/PurchasedContracts';
import { TabSwitch } from './ui/TabSwitch.Styled';
import { SortToolbar } from './ui/SortToolbar';

interface MyOrdersProps {
	userAccount: string;
	contracts: HashRentalContract[];
	currentBlockTimestamp: number;
	setContractId: Dispatch<SetStateAction<string>>;
	editClickHandler: MouseEventHandler<HTMLButtonElement>;
	cancelClickHandler: MouseEventHandler<HTMLButtonElement>;
	isMobile: boolean;
	refreshContracts: any;
	activeOrdersTab: string;
	setActiveOrdersTab: Dispatch<SetStateAction<string>>;
}

// TODO: fix this disgusting interface
export interface HistoryUglyMapped extends ContractHistoryData {
	id: string;
	endDate: string;
	length: string;
	price: string;
	progressPercentage: number;
	speed: string;
	state: string;
	timestamp: string;
	isDeleted?: boolean;
	version?: string;
}

export const MyOrders: React.FC<MyOrdersProps> = ({
	userAccount,
	contracts,
	currentBlockTimestamp,
	setContractId,
	editClickHandler,
	cancelClickHandler,
	isMobile,
	activeOrdersTab,
	setActiveOrdersTab,
}) => {
	const [isLargeBreakpointOrGreater, setIsLargeBreakpointOrGreater] = useState<boolean>(true);
	const [isMediumBreakpointOrBelow, setIsMediumBreakpointOrBelow] = useState<boolean>(false);
	const [showSpinner, setShowSpinner] = useState<boolean>(true);

	const [runningSortType, setRunningSortType] = useState('');
	const [completedSortType, setCompletedSortType] = useState('');

	const mediaQueryListLarge = window.matchMedia('(min-width: 1280px)');
	const mediaQueryListMedium = window.matchMedia('(max-width:1279px)');
	setMediaQueryListOnChangeHandler(
		mediaQueryListLarge,
		isLargeBreakpointOrGreater,
		setIsLargeBreakpointOrGreater
	);
	setMediaQueryListOnChangeHandler(
		mediaQueryListMedium,
		isMediumBreakpointOrBelow,
		setIsMediumBreakpointOrBelow
	);

	useEffect(() => {
		// console.log("refresh page data");
		//refreshContracts();
	}, []);

	useEffect(() => {
		if (!mediaQueryListLarge?.matches) {
			setIsLargeBreakpointOrGreater(false);
		} else {
			setIsLargeBreakpointOrGreater(true);
		}

		if (mediaQueryListMedium?.matches) {
			setIsMediumBreakpointOrBelow(true);
		} else {
			setIsMediumBreakpointOrBelow(false);
		}
	}, [mediaQueryListLarge?.matches, mediaQueryListMedium?.matches]);

	const runningContracts = useMemo(() => {
		const buyerOrders = contracts.filter(
			(contract) => contract.buyer === userAccount && contract.state === ContractState.Running
		);

		if (contracts.length) {
			setShowSpinner(false);
		}

		const runningContracts = buyerOrders.filter(
			(contract) => contract.state === ContractState.Running
		);
		return sortContracts(runningSortType, runningContracts);
	}, [contracts, isLargeBreakpointOrGreater, runningSortType]);

	const completedContracts = useMemo(() => {
		const buyerOrders = contracts
			.filter((contract) => contract?.history?.length)
			.map((c) => c.history!)
			.flat();
		if (contracts.length) {
			setShowSpinner(false);
		}

		return sortContracts(completedSortType, buyerOrders);
	}, [contracts, isLargeBreakpointOrGreater, completedSortType]);

	const handleRunningTab = () => {
		setActiveOrdersTab(CurrentTab.Running);
	};

	const handleCompletedTab = () => {
		setActiveOrdersTab(CurrentTab.Completed);
	};

	// Remove spinner if no orders after 1 minute
	useInterval(() => {
		if (showSpinner) setShowSpinner(false);
	}, 15000);

	useEffect(() => {
		if (contracts.length > 0) {
			setShowSpinner(false);
		}
	});

	const runningContractsCards: Card[] = runningContracts.map((contract) => {
		const endTime = Number(contract.timestamp) + Number(contract.length);
		const progressPercentage = getProgressPercentage(
			contract.state,
			contract.timestamp,
			Number(contract.length),
			currentBlockTimestamp
		);

		const poolInfoString = localStorage.getItem(contract.id!);
		const poolInfoParsed = poolInfoString ? JSON.parse(poolInfoString) : {};
		const { poolAddress = '', username = '' } = poolInfoParsed;

		return {
			contractAddr: contract.id!,
			startTime: Number(contract.timestamp!),
			endTime: endTime,
			progressPercentage: progressPercentage,
			speedHps: String(contract.speed!),
			price: contract.price!,
			fee: contract.fee!,
			length: String(contract.length!),
			poolAddress: poolAddress,
			poolUsername: username,
		};
	});

	const completedContractsCards: Card[] = completedContracts.map((contract) => {
		const poolInfoString = localStorage.getItem(contract.id!);
		const poolInfoParsed = poolInfoString ? JSON.parse(poolInfoString) : {};
		const { poolAddress = '', username = '' } = poolInfoParsed;

		return {
			contractAddr: contract.id!,
			startTime: Number(contract.purchaseTime!),
			endTime: Number(contract.endTime!),
			progressPercentage: 100,
			speedHps: String(contract.speed!),
			price: contract.price!,
			fee: '0',
			length: String(contract.length!),
			poolAddress: poolAddress,
			poolUsername: username,
		};
	});

	return (
		<>
			<TabSwitch>
				<button
					id='running'
					className={activeOrdersTab === CurrentTab.Running ? 'active' : ''}
					onClick={handleRunningTab}
				>
					Active <span>{showSpinner ? '' : runningContracts.length}</span>
				</button>
				<button
					id='completed'
					className={activeOrdersTab === CurrentTab.Completed ? 'active' : ''}
					onClick={handleCompletedTab}
				>
					Completed <span>{showSpinner ? '' : completedContracts.length}</span>
				</button>
				<span className='glider'></span>
			</TabSwitch>
			<div className='flex flex-col items-center'>
				{activeOrdersTab === CurrentTab.Running && (
					<>
						{runningContracts.length > 0 ? (
							<>
								<SortToolbar
									pageTitle='Running Contracts'
									sortType={runningSortType}
									setSortType={setRunningSortType}
									isMobile={isMobile}
								/>
								<PurchasedContracts
									sortType={runningSortType}
									contracts={runningContractsCards}
									editClickHandler={editClickHandler}
									cancelClickHandler={cancelClickHandler}
									setContractId={setContractId}
								/>
							</>
						) : (
							!showSpinner && <p className='text-2xl text-white'>You have no running contracts.</p>
						)}
					</>
				)}
				{activeOrdersTab === CurrentTab.Completed && (
					<>
						{completedContracts.length > 0 ? (
							<>
								<SortToolbar
									pageTitle='Finished Contracts'
									sortType={completedSortType}
									setSortType={setCompletedSortType}
									isMobile={isMobile}
								/>
								<FinishedContracts
									contracts={completedContractsCards}
									sortType={completedSortType}
									editClickHandler={editClickHandler}
									cancelClickHandler={cancelClickHandler}
									setContractId={setContractId}
								/>
							</>
						) : (
							!showSpinner && (
								<p className='text-2xl text-white'>You have no completed contracts.</p>
							)
						)}
					</>
				)}
				{showSpinner && (
					<div className='spinner'>
						<Spinner />
					</div>
				)}
			</div>
		</>
	);
};

MyOrders.displayName = 'MyOrders';
MyOrders.whyDidYouRender = false;
