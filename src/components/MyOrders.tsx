import React, { useCallback, useMemo } from 'react';
import { TableIcon } from './ui/TableIcon';
import { ReactComponent as Hashrate } from '../images/hashrate.svg';
import { Column, useTable } from 'react-table';
import { MyOrder } from './Main';
import { Table } from './ui/Table';
import { classNames, truncateAddress } from '../utils';
import _ from 'lodash';

export interface MyOrdersData {
	id?: JSX.Element | string;
	started?: string;
	status?: JSX.Element | string;
	delivered?: string;
	progress?: string;
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
	const getTableData: (orders: MyOrder[]) => MyOrdersData[] = useCallback((orders) => {
		const updatedOrders = orders.map((order) => {
			const updatedOrder = { ...order };
			if (Object.keys(order).length !== 0 && typeof order.id === 'string') {
				updatedOrder.id = <TableIcon icon={<Hashrate />} text={truncateAddress(updatedOrder.id as string, true)} hasLink justify='start' />;
				updatedOrder.status = getStatusDiv(updatedOrder.status as string);
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
			{ Header: 'ORDER ID', accessor: 'id' },
			{ Header: 'STARTED', accessor: 'started' },
			{ Header: 'STATUS', accessor: 'status' },
			{ Header: 'DELIVERD VS PROMISED (TH/S)', accessor: 'delivered' },
			{ Header: 'PROGRESS', accessor: 'progress' },
		],
		[]
	);

	const data = useMemo(() => getTableData(orders), [orders, getTableData]);
	const tableInstance = useTable<CustomTableOptions>({ columns, data });

	return <Table id='myorders' tableInstance={tableInstance} />;
};

MyOrders.displayName = 'MyOrders';
MyOrders.whyDidYouRender = false;
