/* eslint-disable react-hooks/exhaustive-deps */
import React, { Dispatch, MouseEventHandler, SetStateAction, useEffect, useMemo, useState } from 'react';
import { Table } from './ui/Table';
import { TableIcon } from './ui/TableIcon';
import { Column, useTable } from 'react-table';
import { getLengthDisplay, getProgressDiv, getStatusDiv, setMediaQueryListOnChangeHandler } from '../utils';
import { DateTime } from 'luxon';
import { ContractData, ContractState, HashRentalContract, Header } from '../types';
import { EditCancelButtonGroup } from './ui/FormButtons/EditCancelButtonGroup';
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

	const columns: Column<CustomTableOptions>[] = useMemo(
		() => [
			{ Header: 'CONTRACT ADDRESS', accessor: 'id' },
			{ Header: 'STARTED', accessor: 'timestamp' },
			{ Header: 'DURATION (DAYS)', accessor: 'length' },
			{ Header: 'STATUS', accessor: 'status' },
			{ Header: 'PROGRESS', accessor: 'progress' },
			{ Header: '', accessor: 'editCancel' },
		],
		[]
	);

	const data = getTableData();
	const tableInstance = useTable<CustomTableOptions>({ columns, data });

	return <Table id='myorders' tableInstance={tableInstance} columnCount={5} isLargeBreakpointOrGreater={isLargeBreakpointOrGreater} />;
};

MyOrders.displayName = 'MyOrders';
MyOrders.whyDidYouRender = false;
