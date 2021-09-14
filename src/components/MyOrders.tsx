import React, { useEffect, useMemo, useState } from 'react';
import { ReactComponent as Hashrate } from '../images/hashrate.svg';
import { ProgressBar } from './ui/ProgressBar';
import { Table } from './ui/Table';
import { TableIcon } from './ui/TableIcon';
import { Column, useTable } from 'react-table';
import { MyOrder } from './Main';
import { AddressLength, classNames, truncateAddress } from '../utils';
import _ from 'lodash';

export interface MyOrdersData {
	id?: JSX.Element | string;
	started?: string;
	status?: JSX.Element | string;
	delivered?: string;
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
}

export const MyOrders: React.FC<MyOrdersProps> = ({ orders }) => {
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
	mediaQueryList.onchange = mediaQueryListOnChangeHandler;

	useEffect(() => {
		if (!mediaQueryList.matches) {
			setIsLargeBreakpointOrGreater(false);
		} else {
			setIsLargeBreakpointOrGreater(true);
		}
	}, [mediaQueryList.matches]);

	const getStatusDiv: (status: string) => JSX.Element = (status) => {
		return (
			<div className='flex justify-center'>
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

	const getProgressDiv: (progress: string) => JSX.Element = (progress) => {
		const hashrates = progress.split('/');
		const delivered = hashrates[0];
		const promised = hashrates[1];
		const percentage = (parseInt(delivered) / parseInt(promised)) * 100;
		return (
			<div className='flex justify-evenly items-baseline'>
				<div>{percentage}%</div>
				<div className='w-1/2'>
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
						icon={<Hashrate />}
						text={
							isLargeBreakpointOrGreater
								? truncateAddress(updatedOrder.id as string)
								: truncateAddress(updatedOrder.id as string, AddressLength.short)
						}
						hasLink
						justify='start'
					/>
				);
				updatedOrder.status = getStatusDiv(updatedOrder.status as string);
				updatedOrder.progress = getProgressDiv(updatedOrder.delivered as string);
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
			{ Header: 'DELIVERED VS PROMISED (TH/S)', accessor: 'delivered' },
			{ Header: 'PROGRESS', accessor: 'progress' },
		],
		[]
	);

	const data = getTableData(orders);
	const tableInstance = useTable<CustomTableOptions>({ columns, data });

	return <Table id='myorders' tableInstance={tableInstance} columnCount={5} />;
};

MyOrders.displayName = 'MyOrders';
MyOrders.whyDidYouRender = false;
