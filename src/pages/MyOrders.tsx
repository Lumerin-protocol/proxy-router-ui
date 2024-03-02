/* eslint-disable react-hooks/exhaustive-deps */
import React, { Dispatch, useEffect, useMemo, useState } from 'react';
import { TableIcon } from '../components/ui/TableIcon';
import {
	getProgressDiv,
	getProgressPercentage,
	getStatusDiv,
	setMediaQueryListOnChangeHandler,
	sortContractsV2,
} from '../utils';
import { DateTime } from 'luxon';
import {
	ContractState,
	HashRentalContract,
	CurrentTab,
	ContractHistoryData,
	SortTypes,
} from '../types';
import { Spinner } from '../components/ui/Spinner.styled';
import { useInterval } from '../hooks/useInterval';
import { ButtonGroup } from '../components/ui/ButtonGroup';
import { EditButton } from '../components/ui/Forms/FormButtons/EditButton';
import { CancelButton } from '../components/ui/Forms/FormButtons/CancelButton';
import { divideByDigits } from '../web3/helpers';
import _ from 'lodash';
import { FinishedContracts, PurchasedContracts } from '../components/ui/Cards/PurchasedContracts';
import { TabSwitch } from '../components/ui/TabSwitch.Styled';
import { SortToolbar } from '../components/ui/SortToolbar';
import { EthereumGateway } from '../gateway/ethereum';
import { ModalItem } from '../components/ui/Modal';
import { EditForm as BuyerEditForm } from '../components/ui/Forms/BuyerForms/EditForm';
import { CancelForm } from '../components/ui/Forms/BuyerForms/CancelForm';

interface MyOrdersProps {
	web3Gateway?: EthereumGateway;
	userAccount: string;
	contracts: HashRentalContract[];
	currentBlockTimestamp: number;
	isMobile: boolean;
	refreshContracts: any;
	activeOrdersTab: string;
	setActiveOrdersTab: Dispatch<CurrentTab>;
}

// TODO: fix this disgusting interface
export interface HistoryUglyMapped extends ContractHistoryData {
	id: JSX.Element;
	contractId: string;
	editCancel: JSX.Element;
	endDate: string;
	length: string;
	price: number;
	progress: JSX.Element;
	progressPercentage: number;
	speed: string;
	state: string;
	status: JSX.Element;
	timestamp: string;
	isDeleted?: boolean;
	version?: string;
}

export const MyOrders: React.FC<MyOrdersProps> = ({
	web3Gateway,
	userAccount,
	contracts,
	currentBlockTimestamp,
	isMobile,
	activeOrdersTab,
	setActiveOrdersTab,
}) => {
	const [isLargeBreakpointOrGreater, setIsLargeBreakpointOrGreater] = useState<boolean>(true);
	const [isMediumBreakpointOrBelow, setIsMediumBreakpointOrBelow] = useState<boolean>(false);
	const [showSpinner, setShowSpinner] = useState<boolean>(true);

	const [buyerEditModalOpen, setBuyerEditModalOpen] = useState<boolean>(false);
	const [buyerEditContractId, setBuyerEditContractId] = useState<string>('');

	const [cancelModalOpen, setCancelModalOpen] = useState<boolean>(false);
	const [cancelContractId, setCancelContractId] = useState<string>('');

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

	const getTableData: () => HistoryUglyMapped[] = () => {
		const buyerOrders = contracts.filter(
			(contract) => contract.buyer === userAccount && contract.state === ContractState.Running
		);

		if (contracts.length) {
			setShowSpinner(false);
		}

		const updatedOrders = buyerOrders.map((contract) => {
			const updatedOrder = { ...contract } as unknown as HistoryUglyMapped;
			if (!_.isEmpty(contract)) {
				// FIX IT!
				updatedOrder.id = (
					<TableIcon
						icon={null}
						isLargeBreakpointOrGreater={isLargeBreakpointOrGreater}
						text={contract.id as string}
						hasLink
						justify='start'
					/>
				) as any;
				updatedOrder.price = divideByDigits(Number(updatedOrder.price));
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
				updatedOrder.endDate = DateTime.fromSeconds(parseInt(contract.timestamp as string))
					.plus({ hours: parseInt(contract.length as string) / 3600 })
					.toFormat('MM/dd/yyyy');
				updatedOrder.contractId = contract.id as string;
				updatedOrder.editCancel = (
					<ButtonGroup
						button1={
							<EditButton
								contractId={contract.id as string}
								setContractId={setBuyerEditContractId}
								editClickHandler={() => setBuyerEditModalOpen(true)}
							/>
						}
						button2={
							<CancelButton
								contractId={contract.id as string}
								setContractId={setCancelContractId}
								cancelClickHandler={() => setCancelModalOpen(true)}
							/>
						}
					/>
				);
			}
			return updatedOrder;
		});

		return updatedOrders;
	};

	const getHistoryTableData: () => HistoryUglyMapped[] = () => {
		const buyerOrders = contracts
			.filter((contract) => contract?.history?.length)
			.map((c) => c.history)
			.flat();

		if (contracts.length) {
			setShowSpinner(false);
		}

		const updatedOrders = buyerOrders.map((contract) => {
			const updatedOrder = { ...contract } as HistoryUglyMapped;
			if (!_.isEmpty(contract)) {
				updatedOrder.id = (
					<TableIcon
						icon={null}
						isLargeBreakpointOrGreater={isLargeBreakpointOrGreater}
						text={contract.id as string}
						hasLink
						justify='start'
					/>
				);
				updatedOrder.price = divideByDigits(updatedOrder._price as number);
				updatedOrder.status = getStatusDiv(ContractState.Running);
				updatedOrder.progress = getProgressDiv(
					ContractState.Running as string,
					updatedOrder._purchaseTime as string,
					parseInt(updatedOrder._length as string),
					Number(contract._endTime)
				);
				updatedOrder.progressPercentage = getProgressPercentage(
					ContractState.Running as string,
					updatedOrder._purchaseTime as string,
					parseInt(updatedOrder._length as string),
					Number(updatedOrder._endTime)
				);
				updatedOrder.speed = String(Number(updatedOrder._speed) / 10 ** 12);
				updatedOrder.length = String(parseInt(updatedOrder._length as string) / 3600);
				updatedOrder.timestamp = DateTime.fromSeconds(
					parseInt(updatedOrder._purchaseTime as string)
				).toFormat('MM/dd/yyyy');
				updatedOrder.endDate = DateTime.fromSeconds(parseInt(updatedOrder._purchaseTime as string))
					.plus({ hours: parseInt(updatedOrder._length as string) / 3600 })
					.toFormat('MM/dd/yyyy');
				updatedOrder.contractId = contract.id as string;
			}
			return updatedOrder;
		});

		return updatedOrders;
	};

	const data = useMemo(() => getTableData(), [contracts, isLargeBreakpointOrGreater]);
	const historyData = useMemo(() => getHistoryTableData(), [contracts, isLargeBreakpointOrGreater]);

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
		if (data.length > 0) {
			setShowSpinner(false);
		}
	});

	const [runningSortType, setRunningSortType] = useState(SortTypes.Default);
	const [completedSortType, setCompletedSortType] = useState(SortTypes.Default);

	const runningContracts = sortContractsV2(
		runningSortType,
		data.filter((contract) => contract.progressPercentage! < 100)
	);
	const completedContracts = sortContractsV2(completedSortType, historyData);

	console.log('runningContracts', runningContracts);
	console.log('completedContracts', completedContracts);

	return (
		<>
			<ModalItem
				open={buyerEditModalOpen}
				onClose={() => setBuyerEditModalOpen(false)}
				content={
					<BuyerEditForm
						contracts={contracts}
						contractId={buyerEditContractId}
						userAccount={userAccount}
						web3Gateway={web3Gateway}
						onClose={() => setBuyerEditModalOpen(false)}
					/>
				}
			/>
			<ModalItem
				open={cancelModalOpen}
				onClose={() => setCancelModalOpen(false)}
				content={
					<CancelForm
						contracts={contracts}
						contractId={cancelContractId}
						userAccount={userAccount}
						web3Gateway={web3Gateway}
						onClose={() => setCancelModalOpen(false)}
					/>
				}
			/>
			<TabSwitch>
				<button
					id='running'
					className={activeOrdersTab === CurrentTab.Running ? 'active' : ''}
					onClick={handleRunningTab}
				>
					Running <span>{showSpinner ? '' : runningContracts.length}</span>
				</button>
				<button
					id='completed'
					className={activeOrdersTab === CurrentTab.Completed ? 'active' : ''}
					onClick={handleCompletedTab}
				>
					Finished <span>{showSpinner ? '' : completedContracts.length}</span>
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
								<PurchasedContracts sortType={runningSortType} contracts={runningContracts} />
							</>
						) : (
							!showSpinner && <p className='text-2xl'>You have no running contracts.</p>
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
								<FinishedContracts contracts={completedContracts} sortType={completedSortType} />
							</>
						) : (
							!showSpinner && <p className='text-2xl'>You have no finished contracts.</p>
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
