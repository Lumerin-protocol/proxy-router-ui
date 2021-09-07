import React, { useCallback, useMemo } from 'react';
import { TableIcon } from './ui/TableIcon';
import { ReactComponent as Hashrate } from '../images/hashrate.svg';
import { Column, useTable } from 'react-table';
import { MyOrder } from './Main';
import { Table } from './ui/Table';
import { classNames, truncateAddress } from '../utils';
import _ from 'lodash';
import { ProgressBar } from './ui/ProgressBar';

export interface MyOrdersData {
	id?: JSX.Element | string;
	started?: string;
	status?: JSX.Element | string;
	delivered?: string;
	progress?: JSX.Element | string;
}

interface MyOrdersProps {
	orders: MyOrder[];
}

export const MyOrders: React.FC<MyOrdersProps> = ({ orders }) => {
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
		const numbers = progress.split('/');
		const delivered = numbers[0];
		const promised = numbers[1];
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

	const getTableData: (orders: MyOrder[]) => MyOrdersData[] = useCallback((orders) => {
		const updatedOrders = orders.map((order) => {
			const updatedOrder = { ...order };
			if (Object.keys(order).length !== 0 && typeof order.id === 'string') {
				updatedOrder.id = <TableIcon icon={<Hashrate />} text={truncateAddress(updatedOrder.id as string, true)} hasLink justify='start' />;
				updatedOrder.status = getStatusDiv(updatedOrder.status as string);
				updatedOrder.progress = getProgressDiv(updatedOrder.delivered as string);
			}
			return updatedOrder;
		});

		return updatedOrders;
	}, []);

	interface Header {
		Header?: string;
		accessor?: string;
	}

	// This interface needs to have all the properties for both data and columns based on index.d.ts
	interface CustomTableOptions extends MyOrdersData, Header {}

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

	const data = useMemo(() => getTableData(orders), [orders, getTableData]);
	const tableInstance = useTable<CustomTableOptions>({ columns, data });

	return <Table id='myorders' tableInstance={tableInstance} columnCount={5} />;
};

MyOrders.displayName = 'MyOrders';
MyOrders.whyDidYouRender = false;
