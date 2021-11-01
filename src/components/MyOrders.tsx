/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useMemo, useState } from 'react';
import { ProgressBar } from './ui/ProgressBar';
import { Table } from './ui/Table';
import { TableIcon } from './ui/TableIcon';
import { Column, useTable } from 'react-table';
import { classNames, getStatusText, setMediaQueryListOnChangeHandler, truncateAddress } from '../utils';
import { DateTime } from 'luxon';
import { AddressLength, ContractData, ContractState, HashRentalContract, Header, StatusText } from '../types';
import _ from 'lodash';

// This interface needs to have all the properties for both data and columns based on index.d.ts
interface CustomTableOptions extends ContractData, Header {}

interface MyOrdersProps {
	userAccount: string;
	contracts: HashRentalContract[];
	currentBlockTimestamp: number;
}

export const MyOrders: React.FC<MyOrdersProps> = ({ userAccount, contracts, currentBlockTimestamp }) => {
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

	const getStatusDiv: (state: string) => JSX.Element = (state) => {
		return (
			<div>
				<span
					className={classNames(
						state === ContractState.Available || state === ContractState.Running
							? 'w-20 bg-lumerin-green text-white'
							: 'w-28 bg-lumerin-dark-gray text-black',
						'flex justify-center items-center h-8 rounded-5'
					)}
				>
					<p>{_.capitalize(getStatusText(state))}</p>
				</span>
			</div>
		);
	};

	const getProgressDiv: (startTime: string, length: number) => JSX.Element = (startTime, length) => {
		let timeElapsed: number = 0;
		let percentage: number = 0;
		if (length === 0 || currentBlockTimestamp === 0) {
			percentage = 100;
		} else {
			timeElapsed = (currentBlockTimestamp as number) - parseInt(startTime);
			percentage = (timeElapsed / length) * 100;
		}

		return (
			<div className='flex items-baseline'>
				<div>{percentage.toFixed()}%</div>
				<div className='w-1/2 ml-4'>
					<ProgressBar width={percentage.toString()} />
				</div>
			</div>
		);
	};

	const getTableData: () => ContractData[] = () => {
		const buyerOrders = contracts.filter((contract) => contract.buyer === userAccount);
		// Add emtpy row for styling
		buyerOrders.unshift({});
		const updatedOrders = buyerOrders.map((contract) => {
			const updatedOrder = { ...contract } as ContractData;
			if (!_.isEmpty(contract)) {
				updatedOrder.id = (
					<TableIcon
						icon={null}
						text={
							isLargeBreakpointOrGreater
								? truncateAddress(updatedOrder.id as string)
								: truncateAddress(updatedOrder.id as string, AddressLength.SHORT)
						}
						hasLink
						justify='start'
					/>
				);
				updatedOrder.status = getStatusDiv(updatedOrder.state as string);
				updatedOrder.progress = getProgressDiv(updatedOrder.timestamp as string, parseInt(updatedOrder.length as string));
				updatedOrder.timestamp = DateTime.fromSeconds(parseInt(updatedOrder.timestamp as string)).toFormat('MM/dd/yyyy hh:mm:ss');
			}
			return updatedOrder as ContractData;
		});

		return updatedOrders;
	};

	const columns: Column<CustomTableOptions>[] = useMemo(
		() => [
			{ Header: 'CONTRACT ADDRESS', accessor: 'id' },
			{ Header: 'STARTED', accessor: 'timestamp' },
			{ Header: 'STATUS', accessor: 'status' },
			{ Header: 'PROGRESS', accessor: 'progress' },
		],
		[]
	);

	const data = getTableData();
	const tableInstance = useTable<CustomTableOptions>({ columns, data });

	return <Table id='myorders' tableInstance={tableInstance} columnCount={5} isLargeBreakpointOrGreater={isLargeBreakpointOrGreater} />;
};

MyOrders.displayName = 'MyOrders';
MyOrders.whyDidYouRender = false;
