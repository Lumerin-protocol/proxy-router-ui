/* eslint-disable react-hooks/exhaustive-deps */
import React, { Dispatch, MouseEventHandler, SetStateAction, useEffect, useMemo, useState } from 'react';
import { Table } from './ui/Table';
import { TableIcon } from './ui/TableIcon';
import { Column, Row, SortByFn, useSortBy, useTable } from 'react-table';
import { getLengthDisplay, getProgressDiv, getStatusDiv, setMediaQueryListOnChangeHandler, sortByNumber } from '../utils';
import { DateTime } from 'luxon';
import { ContractData, ContractState, HashRentalContract, Header, SortByType } from '../types';
import { EditCancelButtonGroup } from './ui/Forms/FormButtons/EditCancelButtonGroup';
import { Spinner } from './ui/Spinner';
import { useInterval } from './hooks/useInterval';
import _ from 'lodash';

// This interface needs to have all the properties for both data and columns based on index.d.ts
interface CustomTableOptions extends ContractData, Header {}

interface MyOrdersProps {
	userAccount: string;
	contracts: HashRentalContract[];
	currentBlockTimestamp: number;
	setContractId: Dispatch<SetStateAction<string>>;
	editClickHandler: MouseEventHandler<HTMLButtonElement>;
	cancelClickHandler: MouseEventHandler<HTMLButtonElement>;
}

export const MyOrders: React.FC<MyOrdersProps> = ({
	userAccount,
	contracts,
	currentBlockTimestamp,
	setContractId,
	editClickHandler,
	cancelClickHandler,
}) => {
	const [isLargeBreakpointOrGreater, setIsLargeBreakpointOrGreater] = useState<boolean>(true);
	const [showSpinner, setShowSpinner] = useState<boolean>(true);

	// Adjust contract address length when breakpoint > lg
	const mediaQueryList = window.matchMedia('(min-width: 1200px)');
	setMediaQueryListOnChangeHandler(mediaQueryList, isLargeBreakpointOrGreater, setIsLargeBreakpointOrGreater);

	useEffect(() => {
		if (!mediaQueryList?.matches) {
			setIsLargeBreakpointOrGreater(false);
		} else {
			setIsLargeBreakpointOrGreater(true);
		}
	}, [mediaQueryList?.matches]);

	useEffect(() => {
		if (!mediaQueryList?.matches) {
			setIsLargeBreakpointOrGreater(false);
		} else {
			setIsLargeBreakpointOrGreater(true);
		}
	}, [mediaQueryList?.matches]);

	const getTableData: () => ContractData[] = () => {
		const buyerOrders = contracts.filter(
			(contract) => contract.buyer === userAccount && (contract.state === ContractState.Running || contract.state === ContractState.Complete)
		);
		// Add emtpy row for styling
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
				updatedOrder.status = getStatusDiv(updatedOrder.state as string);
				updatedOrder.progress = getProgressDiv(
					updatedOrder.state as string,
					updatedOrder.timestamp as string,
					parseInt(updatedOrder.length as string),
					currentBlockTimestamp
				);
				updatedOrder.length = getLengthDisplay(parseInt(updatedOrder.length as string));
				updatedOrder.timestamp = DateTime.fromSeconds(parseInt(updatedOrder.timestamp as string)).toFormat('MM/dd/yyyy hh:mm:ss');
				updatedOrder.editCancel = (
					<EditCancelButtonGroup
						contractId={contract.id as string}
						setContractId={setContractId}
						editClickHandler={editClickHandler}
						cancelClickHandler={cancelClickHandler}
					/>
				);
			}
			return updatedOrder as ContractData;
		});

		return updatedOrders;
	};

	// TODO: if same as <MyContracts /> pull out into util function
	const customSort: SortByFn<CustomTableOptions> = (rowA: Row, rowB: Row, columnId: string, desc?: boolean) => {
		if (_.isEmpty(rowA.original)) return desc ? 1 : -1;
		if (_.isEmpty(rowB.original)) return desc ? -1 : 1;

		switch (columnId) {
			case 'status':
				return sortByNumber(rowA.values.status.key, rowB.values.status.key, SortByType.Int);
			case 'price':
				return sortByNumber(rowA.values.price, rowB.values.price, SortByType.Int);
			case 'length':
				return sortByNumber(rowA.values.length, rowB.values.length, SortByType.Float);
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

	const columns: Column<CustomTableOptions>[] = useMemo(
		() => [
			{ Header: 'CONTRACT ADDRESS', accessor: 'id', disableSortBy: true },
			{ Header: 'STATUS', accessor: 'status', sortType: 'customSort' },
			{ Header: 'PRICE (LMR)', accessor: 'price', sortType: 'customSort' },
			{ Header: 'DURATION (DAYS)', accessor: 'length', sortType: 'customSort' },
			{ Header: 'STARTED', accessor: 'timestamp', sortType: 'customSort' },
			{ Header: 'PROGRESS', accessor: 'progress', sortType: 'customSort' },
			{ Header: '', accessor: 'editCancel', disableSortBy: true },
		],
		[]
	);

	const data = useMemo(() => getTableData(), [contracts, isLargeBreakpointOrGreater]);
	const tableInstance = useTable<CustomTableOptions>({ columns, data, sortTypes }, useSortBy);

	// Remove spinner if no orders after 1 minute
	useInterval(() => {
		if (showSpinner) setShowSpinner(false);
	}, 60000);

	return (
		<div className='flex flex-col'>
			{data.length > 1 ? (
				<Table id='myorders' tableInstance={tableInstance} columnCount={6} isLargeBreakpointOrGreater={isLargeBreakpointOrGreater} />
			) : null}
			{data.length === 1 && showSpinner ? (
				<div className='flex justify-center mt-50 mr-50'>
					<Spinner />
				</div>
			) : null}
			{data.length === 1 && !showSpinner ? <div className='text-2xl'>You have no orders.</div> : null}
		</div>
	);
};

MyOrders.displayName = 'MyOrders';
MyOrders.whyDidYouRender = false;
