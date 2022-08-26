/* eslint-disable react-hooks/exhaustive-deps */
import React, {
	Dispatch,
	MouseEventHandler,
	SetStateAction,
	useEffect,
	useMemo,
	useState,
} from 'react';
import { Table } from './ui/Table';
import { TableIcon } from './ui/TableIcon';
import { Column, Row, SortByFn, useSortBy, useTable } from 'react-table';
import {
	getProgressDiv,
	getStatusDiv,
	setMediaQueryListOnChangeHandler,
	sortByNumber,
} from '../utils';
import { DateTime } from 'luxon';
import { ContractData, ContractState, HashRentalContract, Header, SortByType } from '../types';
import { Spinner } from './ui/Spinner';
import { useInterval } from './hooks/useInterval';
import { ButtonGroup } from './ui/ButtonGroup';
import { EditButton } from './ui/Forms/FormButtons/EditButton';
import { CancelButton } from './ui/Forms/FormButtons/CancelButton';
import { divideByDigits } from '../web3/helpers';
import Web3 from 'web3';
import _ from 'lodash';

// This interface needs to have all the properties for both data and columns based on index.d.ts
interface CustomTableOptions extends ContractData, Header {}

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
		// Add empty row for styling
		buyerOrders.unshift({});
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
				updatedOrder.speed = String(Number(updatedOrder.speed) / 10 ** 12);
				updatedOrder.length = String(parseInt(updatedOrder.length as string) / 3600);
				updatedOrder.timestamp = DateTime.fromSeconds(
					parseInt(updatedOrder.timestamp as string)
				).toFormat('MM/dd/yyyy');
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

	// TODO: if same as <MyContracts /> pull out into util function
	const customSort: SortByFn<CustomTableOptions> = (
		rowA: Row,
		rowB: Row,
		columnId: string,
		desc?: boolean
	) => {
		if (_.isEmpty(rowA.original)) return desc ? 1 : -1;
		if (_.isEmpty(rowB.original)) return desc ? -1 : 1;

		switch (columnId) {
			case 'status':
				return sortByNumber(rowA.values.status.key, rowB.values.status.key, SortByType.Int);
			case 'price':
				return sortByNumber(rowA.values.price, rowB.values.price, SortByType.Int);
			case 'length':
				return sortByNumber(rowA.values.length, rowB.values.length, SortByType.Float);
			case 'speed':
				return sortByNumber(rowA.values.speed, rowB.values.speed, SortByType.Int);
			case 'started':
				return sortByNumber(rowA.values.timestamp, rowB.values.timestamp, SortByType.Int);
			case 'progress':
				return sortByNumber(rowA.values.progress.key, rowB.values.progress.key, SortByType.Int);
			default:
				return 0;
		}
	};

	const sortTypes: Record<string, SortByFn<CustomTableOptions>> = {
		customSort: customSort,
	};

	const columns: Column<CustomTableOptions>[] = useMemo(() => {
		return isMediumBreakpointOrBelow
			? [
					{ Header: 'CONTRACT ADDRESS', accessor: 'id', disableSortBy: true },
					{ Header: 'STATUS', accessor: 'status', sortType: 'customSort' },
					{ Header: 'DURATION', accessor: 'length', sortType: 'customSort' },
					{ Header: 'PROGRESS', accessor: 'progress', sortType: 'customSort' },
					{ Header: 'EDIT', accessor: 'editCancel', disableSortBy: true },
			  ]
			: [
					{ Header: 'CONTRACT ADDRESS', accessor: 'id', disableSortBy: true },
					{ Header: 'STATUS', accessor: 'status', sortType: 'customSort' },
					{ Header: 'PRICE (LMR)', accessor: 'price', sortType: 'customSort' },
					{ Header: 'DURATION (HOURS)', accessor: 'length', sortType: 'customSort' },
					{ Header: 'SPEED (TH/S)', accessor: 'speed', sortType: 'customSort' },
					{ Header: 'STARTED', accessor: 'timestamp', sortType: 'customSort' },
					{ Header: 'PROGRESS', accessor: 'progress', sortType: 'customSort' },
					{ Header: 'EDIT', accessor: 'editCancel', disableSortBy: true },
			  ];
	}, [isMediumBreakpointOrBelow]);

	const data = useMemo(() => getTableData(), [contracts, isLargeBreakpointOrGreater]);
	const tableInstance = useTable<CustomTableOptions>({ columns, data, sortTypes }, useSortBy);

	// Remove spinner if no orders after 1 minute
	useInterval(() => {
		if (showSpinner) setShowSpinner(false);
	}, 7000);

	return (
		<div className='flex flex-col items-center'>
			{data.length > 1 ? (
				<Table id='myorders' tableInstance={tableInstance} columnCount={6} />
			) : null}
			{data.length === 1 && showSpinner ? (
				<div className='spinner'>
					<Spinner />
				</div>
			) : null}
			{data.length === 1 && !showSpinner ? (
				<div className='text-2xl'>You have no orders.</div>
			) : null}
		</div>
	);
};

MyOrders.displayName = 'MyOrders';
MyOrders.whyDidYouRender = false;
