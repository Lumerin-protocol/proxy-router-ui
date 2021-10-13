import React, { useEffect, useMemo, useState } from 'react';
import { ProgressBar } from './ui/ProgressBar';
import { Table } from './ui/Table';
import { TableIcon } from './ui/TableIcon';
import { Column, useTable } from 'react-table';
import { MyOrder } from './Main';
import { AddressLength, classNames, truncateAddress } from '../utils';
import { DateTime } from 'luxon';
import _ from 'lodash';

export interface MyOrdersData {
	id?: JSX.Element | string;
	started?: string;
	status?: JSX.Element | string;
	speed?: number;
	length?: string;
	delivered?: string; // Not used in Stage 1
	progress?: JSX.Element | string;
}

interface Header {
	Header?: string;
	accessor?: string;
}

// This interface needs to have all the properties for both data and columns based on index.d.ts
interface CustomTableOptions extends MyOrdersData, Header {}

interface MyOrdersProps {
	orders: MyOrder[];
	currentBlockTimestamp: number;
}

export const MyOrders: React.FC<MyOrdersProps> = ({ orders, currentBlockTimestamp }) => {
	const [isLargeBreakpointOrGreater, setIsLargeBreakpointOrGreater] = useState<boolean>(true);

	// Adjust contract address length when breakpoint > lg
	const mediaQueryList = window.matchMedia('(min-width: 1024px)');
	// Not an arrow function since parameter is typed as this and arrow function can't have this as parameter
	function mediaQueryListOnChangeHandler(this: MediaQueryList, ev: MediaQueryListEvent): any {
		if (this.matches && !isLargeBreakpointOrGreater) {
			setIsLargeBreakpointOrGreater(true);
		} else if (isLargeBreakpointOrGreater) {
			setIsLargeBreakpointOrGreater(false);
		}
	}
	if (mediaQueryList) mediaQueryList.onchange = mediaQueryListOnChangeHandler;

	useEffect(() => {
		if (!mediaQueryList?.matches) {
			setIsLargeBreakpointOrGreater(false);
		} else {
			setIsLargeBreakpointOrGreater(true);
		}
	}, [mediaQueryList?.matches]);

	const getStatusDiv: (status: string) => JSX.Element = (status) => {
		return (
			<div>
				<span
					className={classNames(
						status === 'active' ? 'w-20 bg-lumerin-green text-white' : 'w-28 bg-lumerin-dark-gray text-black',
						'flex justify-center items-center h-8 rounded-5'
					)}
				>
					<p>{_.capitalize(status)}</p>
				</span>
			</div>
		);
	};

	const getProgressDiv: (startTime: string, length: number) => JSX.Element = (startTime, length) => {
		// Potentially Stage 2 logic
		// const hashrates = progress.split('/');
		// const delivered = hashrates[0];
		// const promised = hashrates[1];
		// const percentage = (parseInt(delivered) / parseInt(promised)) * 100;

		// Determine progress based on time passed compared to contract length
		// Length is dummy data
		// TODO: update when length is accurate
		let timeElapsed: number = 0;
		let percentage: number = 0;
		if (length === 0) {
			percentage = 100;
		} else {
			timeElapsed = (currentBlockTimestamp as number) - parseInt(startTime);
			// TODO: use line below when length is not dummy data
			// percentage = timeElapsed / length;
			percentage = (timeElapsed / 1000000) * 100;
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

	const getTableData: (orders: MyOrder[]) => MyOrdersData[] = (orders) => {
		const updatedOrders = orders.map((order) => {
			const updatedOrder = { ...order };
			if (Object.keys(order).length !== 0) {
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
				updatedOrder.status = getStatusDiv(updatedOrder.status as string);
				updatedOrder.progress = getProgressDiv(updatedOrder.started as string, parseInt(updatedOrder.length as string));
				updatedOrder.started = DateTime.fromSeconds(parseInt(updatedOrder.started as string)).toFormat('MM/dd/yyyy hh:mm:ss');
			}
			return updatedOrder;
		});

		return updatedOrders;
	};

	const columns: Column<CustomTableOptions>[] = useMemo(
		() => [
			{ Header: 'CONTRACT ADDRESS', accessor: 'id' },
			{ Header: 'STARTED', accessor: 'started' },
			{ Header: 'STATUS', accessor: 'status' },
			// Add back during Stage 2
			// { Header: 'DELIVERED VS PROMISED (TH/S)', accessor: 'delivered' },
			{ Header: 'PROGRESS', accessor: 'progress' },
		],
		[]
	);

	const data = getTableData(orders);
	const tableInstance = useTable<CustomTableOptions>({ columns, data });

	return <Table id='myorders' tableInstance={tableInstance} columnCount={5} isLargeBreakpointOrGreater={isLargeBreakpointOrGreater} />;
};

MyOrders.displayName = 'MyOrders';
MyOrders.whyDidYouRender = false;
