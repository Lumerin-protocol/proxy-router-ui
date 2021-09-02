import React, { useCallback, useMemo } from 'react';
import { Column, useTable } from 'react-table';
import { MyOrder } from './Main';
import { Table } from './ui/Table';

export interface MyOrdersData {
	id?: string;
	started?: string;
	status?: string;
	delivered?: string;
	progress?: string;
}

interface MyOrdersProps {
	orders: MyOrder[];
}

export const MyOrders: React.FC<MyOrdersProps> = ({ orders }) => {
	const getTableData: (orders: MyOrder[]) => MyOrdersData[] = useCallback((orders) => {
		const updatedOrders = orders.map((order) => {
			const updatedOrder = { ...order };
			if (Object.keys(order).length !== 0 && typeof order.id === 'string') {
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
