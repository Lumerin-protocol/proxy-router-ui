import { useMemo } from 'react';
import { Column, useTable } from 'react-table';

export const ContractTable: React.FC = () => {
	interface Data {
		id?: number;
		price?: string;
		limit?: string;
		speed?: number;
		length?: string;
		trade?: string;
	}

	const data: Data[] = useMemo(
		() => [
			{},
			{
				id: 1,
				price: '0.3241',
				limit: '0.0100',
				speed: 100,
				length: '4 hours',
				trade: 'Buy',
			},
			{
				id: 2,
				price: '0.3241',
				limit: '0.0100',
				speed: 100,
				length: '24 hours',
				trade: 'Buy',
			},
			{
				id: 3,
				price: '0.3241',
				limit: '0.0100',
				speed: 100,
				length: '3 days',
				trade: 'Buy',
			},
			{
				id: 4,
				price: '0.3241',
				limit: '0.0100',
				speed: 100,
				length: '2 weeks',
				trade: 'Buy',
			},
			{
				id: 5,
				price: '0.3241',
				limit: '0.0100',
				speed: 100,
				length: '4 hours',
				trade: 'Buy',
			},
			{
				id: 6,
				price: '0.3241',
				limit: '0.0100',
				speed: 100,
				length: '1 hour',
				trade: 'Buy',
			},
		],
		[]
	);

	interface Header {
		Header?: string;
		accessor?: string;
	}

	// This interface needs to have all the properties for both data and columns based on index.d.ts
	interface CustomTableOptions extends Data, Header {}

	const columns: Column<CustomTableOptions>[] = useMemo(
		() => [
			{ Header: 'Order ID', accessor: 'id' },
			{ Header: 'PRICE (LMRN/TH/DAY)', accessor: 'price' },
			{ Header: 'LIMIT (TH/S)', accessor: 'limit' },
			{ Header: 'SPEED (TH/S)', accessor: 'speed' },
			{ Header: 'LENGTH (HR/D/W)', accessor: 'length' },
			{ Header: 'TRADE', accessor: 'trade' },
		],
		[]
	);

	const tableInstance = useTable<CustomTableOptions>({ columns, data });
	const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = tableInstance;

	return (
		<table {...getTableProps()} className='w-4/5 m-auto'>
			<thead>
				{headerGroups.map((headerGroup) => (
					<tr {...headerGroup.getHeaderGroupProps()}>
						{headerGroup.headers.map((column) => (
							<th {...column.getHeaderProps()}>{column.render('Header')}</th>
						))}
					</tr>
				))}
			</thead>
			<tbody {...getTableBodyProps()}>
				{rows.map((row) => {
					prepareRow(row);
					return (
						<tr {...row.getRowProps()}>
							{row.cells.map((cell) => {
								return (
									<td
										{...cell.getCellProps()}
										style={{
											padding: '10px',
											border: 'solid 1px gray',
											background: 'papayawhip',
										}}
									>
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

ContractTable.displayName = 'ContractTable';
(ContractTable as any).whyDidYouRender = false;
