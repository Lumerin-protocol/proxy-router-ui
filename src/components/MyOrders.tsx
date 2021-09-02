import React, { useCallback, useMemo } from 'react';
import { createUseStyles } from 'react-jss';
import { Column, useTable } from 'react-table';
import { classNames } from '../utils';
import { MyOrder } from './Main';

const useStyles = createUseStyles({
	table: {
		'&': {
			borderSpacing: 0,
		},
		'& > tbody > tr:first-child': {
			height: '32px',
		},
		'& > tbody > tr > td': {
			backgroundColor: 'white',
			border: '1px solid #E5E7EB',
			borderBottom: 'none',
		},
		'& > tbody > tr > td:first-child': {
			borderRight: 'none',
		},
		'& > tbody > tr > td:nth-child(2)': {
			borderLeft: 'none',
			borderRight: 'none',
			paddingLeft: 0,
		},
		'& > tbody > tr > td:nth-child(3)': {
			borderLeft: 'none',
			borderRight: 'none',
		},
		'& > tbody > tr > td:nth-child(4)': {
			borderLeft: 'none',
			borderRight: 'none',
		},
		'& > tbody > tr > td:last-child': {
			borderLeft: 'none',
		},
		'& > thead > tr > th:first-child': {
			border: '0px solid transparent',
			borderRadius: '5px 0 0 5px',
			width: '20%',
		},
		'& > tbody > tr:first-child > td': {
			border: 'none',
		},

		'& > thead > tr > th:last-child': {
			borderRadius: '0 5px 5px 0',
			width: '10%',
		},
		'& > tbody > tr:nth-child(2) > td:first-child': {
			borderTopLeftRadius: '5px',
		},
		'& > tbody > tr:nth-child(2) > td:last-child': {
			borderTopRightRadius: '5px',
		},
		'& > tbody > tr:last-child > td': {
			borderBottom: '1px solid #E5E7EB',
		},
		'& > tbody > tr:last-child > td:first-child': {
			borderBottomLeftRadius: '5px',
		},
		'& > tbody > tr:last-child > td:last-child': {
			borderBottomRightRadius: '5px',
		},
	},
});

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
	const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = tableInstance;
	const classes = useStyles();

	return (
		<table id='myorders' {...getTableProps()} className={classNames(classes.table, 'w-99 mt-10 relative border-separate h-10 font-Inter')}>
			<thead className='bg-lumerin-dark-gray h-16 text-xs'>
				{headerGroups.map((headerGroup) => (
					<tr {...headerGroup.getHeaderGroupProps()}>
						{headerGroup.headers.map((column) => (
							<th {...column.getHeaderProps()} className='sticky top-0 bg-lumerin-dark-gray'>
								{column.render('Header')}
							</th>
						))}
					</tr>
				))}
			</thead>
			<tbody {...getTableBodyProps()} className='divide-y'>
				{rows.map((row) => {
					prepareRow(row);
					return (
						<tr {...row.getRowProps()} className='h-16 text-center'>
							{row.cells.map((cell) => {
								return (
									<td {...cell.getCellProps()} className='p-2.5 font-semibold text-sm'>
										{cell.render('Cell')}
									</td>
								);
							})}
						</tr>
					);
				})}
			</tbody>
		</table>
	);
};

MyOrders.displayName = 'MyOrders';
MyOrders.whyDidYouRender = false;
