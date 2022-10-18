/* eslint-disable react-hooks/exhaustive-deps */
import React, {
	Dispatch,
	MouseEventHandler,
	SetStateAction,
	useEffect,
	useMemo,
	useState,
} from 'react';
import { TableIcon } from './ui/TableIcon';
import {
	getProgressDiv,
	getProgressPercentage,
	getStatusDiv,
	setMediaQueryListOnChangeHandler,
	sortContracts,
} from '../utils';
import { DateTime } from 'luxon';
import { ContractData, ContractState, HashRentalContract, CurrentTab } from '../types';
import { Spinner } from './ui/Spinner.styled';
import { useInterval } from './hooks/useInterval';
import { ButtonGroup } from './ui/ButtonGroup';
import { EditButton } from './ui/Forms/FormButtons/EditButton';
import { CancelButton } from './ui/Forms/FormButtons/CancelButton';
import { divideByDigits } from '../web3/helpers';
import Web3 from 'web3';
import _ from 'lodash';
import { PurchasedContracts } from './ui/Cards/PurchasedContracts';
import { TabSwitch } from './ui/TabSwitch.Styled';
import { SortToolbar } from './ui/SortToolbar';

interface MyOrdersProps {
	web3: Web3 | undefined;
	userAccount: string;
	contracts: HashRentalContract[];
	currentBlockTimestamp: number;
	setContractId: Dispatch<SetStateAction<string>>;
	editClickHandler: MouseEventHandler<HTMLButtonElement>;
	cancelClickHandler: MouseEventHandler<HTMLButtonElement>;
}

export const MyOrders: React.FC<MyOrdersProps> = ({
	web3,
	userAccount,
	contracts,
	currentBlockTimestamp,
	setContractId,
	editClickHandler,
	cancelClickHandler,
}) => {
	const [isLargeBreakpointOrGreater, setIsLargeBreakpointOrGreater] = useState<boolean>(true);
	const [isMediumBreakpointOrBelow, setIsMediumBreakpointOrBelow] = useState<boolean>(false);
	const [showSpinner, setShowSpinner] = useState<boolean>(true);
	const [currentTab, setCurrentTab] = useState<CurrentTab>(CurrentTab.Running);

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

	const getTableData: () => ContractData[] = () => {
		const buyerOrders = contracts.filter(
			(contract) => contract.buyer === userAccount && contract.state === ContractState.Running
		);

		const updatedOrders = buyerOrders.map((contract) => {
			const updatedOrder = { ...contract } as ContractData;
			if (!_.isEmpty(contract)) {
				updatedOrder.id = (
					<TableIcon
						icon={null}
						isLargeBreakpointOrGreater={isLargeBreakpointOrGreater}
						text={updatedOrder.id as string}
						hasLink
						justify='start'
					/>
				);
				updatedOrder.price = divideByDigits(updatedOrder.price as number);
				updatedOrder.status = getStatusDiv(updatedOrder.state as string);
				updatedOrder.progress = getProgressDiv(
					updatedOrder.state as string,
					updatedOrder.timestamp as string,
					parseInt(updatedOrder.length as string),
					currentBlockTimestamp
				);
				updatedOrder.progressPercentage = getProgressPercentage(
					updatedOrder.state as string,
					updatedOrder.timestamp as string,
					parseInt(updatedOrder.length as string),
					currentBlockTimestamp
				);
				updatedOrder.speed = String(Number(updatedOrder.speed) / 10 ** 12);
				updatedOrder.length = String(parseInt(updatedOrder.length as string) / 3600);
				updatedOrder.timestamp = DateTime.fromSeconds(
					parseInt(updatedOrder.timestamp as string)
				).toFormat('MM/dd/yyyy');
				updatedOrder.contractId = contract.id as string;
				updatedOrder.editCancel = (
					<ButtonGroup
						button1={
							<EditButton
								contractId={contract.id as string}
								setContractId={setContractId}
								editClickHandler={editClickHandler}
							/>
						}
						button2={
							<CancelButton
								contractId={contract.id as string}
								setContractId={setContractId}
								cancelClickHandler={cancelClickHandler}
							/>
						}
					/>
				);
			}
			return updatedOrder as ContractData;
		});

		return updatedOrders;
	};

	const data = useMemo(() => getTableData(), [contracts, isLargeBreakpointOrGreater]);

	const handleRunningTab = () => {
		setCurrentTab(CurrentTab.Running);
	};

	const handleCompletedTab = () => {
		setCurrentTab(CurrentTab.Completed);
	};

	// Remove spinner if no orders after 1 minute
	useInterval(() => {
		if (showSpinner) setShowSpinner(false);
	}, 7000);

	useEffect(() => {
		if (data.length > 0) {
			setShowSpinner(false);
		}
	});

	const [runningContracts, setRunningContracts] = useState<Array<HashRentalContract>>([
		...data.filter((contract) => contract.progressPercentage! < 100),
	]);
	const [completedContracts, setCompletedContracts] = useState<Array<HashRentalContract>>([
		...data.filter((contract) => contract.progressPercentage === 100),
	]);
	const [runningSortType, setRunningSortType] = useState('');
	const [completedSortType, setCompletedSortType] = useState('');

	useEffect(() => {
		sortContracts(runningSortType, runningContracts, setRunningContracts);
	}, [runningSortType]);

	useEffect(() => {
		sortContracts(completedSortType, completedContracts, setCompletedContracts);
	}, [completedSortType]);

	return (
		<>
			<TabSwitch>
				<button
					id='running'
					className={currentTab === CurrentTab.Running ? 'active' : ''}
					onClick={handleRunningTab}
				>
					Running <span>{showSpinner ? '' : runningContracts.length}</span>
				</button>
				<button
					id='completed'
					className={currentTab === CurrentTab.Completed ? 'active' : ''}
					onClick={handleCompletedTab}
				>
					Completed <span>{showSpinner ? '' : completedContracts.length}</span>
				</button>
				<span className='glider'></span>
			</TabSwitch>
			<div className='flex flex-col items-center'>
				{currentTab === CurrentTab.Running && (
					<>
						{runningContracts.length > 0 ? (
							<>
								<SortToolbar
									pageTitle='Running Contracts'
									sortType={runningSortType}
									setSortType={setRunningSortType}
								/>
								<PurchasedContracts
									sortType={runningSortType}
									contracts={runningContracts}
									isCompleted={false}
								/>
							</>
						) : (
							!showSpinner && <p className='text-2xl'>You have no running contracts.</p>
						)}
					</>
				)}
				{currentTab === CurrentTab.Completed && (
					<>
						{completedContracts.length > 0 ? (
							<>
								<SortToolbar
									pageTitle='Completed Contracts'
									sortType={completedSortType}
									setSortType={setCompletedSortType}
								/>
								<PurchasedContracts
									contracts={completedContracts}
									isCompleted={true}
									sortType={completedSortType}
								/>
							</>
						) : (
							!showSpinner && <p className='text-2xl'>You have no completed contracts.</p>
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
