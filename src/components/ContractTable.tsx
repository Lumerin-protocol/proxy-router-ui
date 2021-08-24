import { useMemo } from 'react';
import { Column, useTable } from 'react-table';
import { createUseStyles } from 'react-jss';
import { classNames } from '../utils';
import { ReactComponent as Hashrate } from '../images/hashrate.svg';
import { ReactComponent as Lumerin } from '../images/lumerin.svg';
import { TableIcon } from './ui/TableIcon';

const useStyles = createUseStyles({
	table: {
		width: '95%',
		'& > tbody > tr > td': {
			backgroundColor: 'white',
		},
		'& > thead > tr > th:first-child': {
			border: '1px solid transparent',
			borderRadius: '100px 0 0 100px',
		},
		'& > tbody > tr:first-child': {
			height: '20px',
		},
		'& > tbody > tr:first-child > td': {
			backgroundColor: '#F2F5F9 !important',
		},
		'& > thead > tr > th:last-child': {
			border: '1px solid transparent',
			borderRadius: '0 100px 100px 0',
		},
		'& > tbody > tr:nth-child(2) > td': {
			border: '1px solid transparent',
			borderBottomColor: '#E5E7EB',
		},
		'& > tbody > tr:nth-child(2) > td:first-child': {
			border: '1px solid transparent',
			borderBottomColor: '#E5E7EB',
			borderTopLeftRadius: '30px',
		},
		'& > tbody > tr:nth-child(2) > td:last-child': {
			border: '1px solid transparent',
			borderBottomColor: '#E5E7EB',
			borderTopRightRadius: '30px',
		},
		'& > tbody > tr:last-child > td:first-child': {
			border: '1px solid transparent',
			borderTopColor: '#E5E7EB',
			borderBottomLeftRadius: '30px',
		},
		'& > tbody > tr:last-child > td:last-child': {
			border: '1px solid transparent',
			borderTopColor: '#E5E7EB',
			borderBottomRightRadius: '30px',
		},
	},
});

export const ContractTable: React.FC = () => {
	interface Data {
		id?: JSX.Element | string;
		price?: JSX.Element | string;
		limit?: string;
		speed?: number;
		length?: string;
		trade?: JSX.Element | string;
	}

	const BuyButton = (
		<button type='button' className='w-20 h-8 rounded-xl p-auto bg-lumerin-aqua text-white font-medium' onClick={() => {}}>
			<span>Buy</span>
		</button>
	);

	const data: Data[] = useMemo(
		() => [
			{},
			{
				id: <TableIcon icon={<Hashrate />} text={1} />,
				price: <TableIcon icon={<Lumerin />} text='0.3241' />,
				limit: '0.0100',
				speed: 100,
				length: '4 hours',
				trade: BuyButton,
			},
			{
				id: <TableIcon icon={<Hashrate />} text={1} />,
				price: <TableIcon icon={<Lumerin />} text='0.3241' />,
				limit: '0.0100',
				speed: 100,
				length: '24 hours',
				trade: BuyButton,
			},
			{
				id: <TableIcon icon={<Hashrate />} text={1} />,
				price: <TableIcon icon={<Lumerin />} text='0.3241' />,
				limit: '0.0100',
				speed: 100,
				length: '3 days',
				trade: BuyButton,
			},
			{
				id: <TableIcon icon={<Hashrate />} text={1} />,
				price: <TableIcon icon={<Lumerin />} text='0.3241' />,
				limit: '0.0100',
				speed: 100,
				length: '2 weeks',
				trade: BuyButton,
			},
			{
				id: <TableIcon icon={<Hashrate />} text={1} />,
				price: <TableIcon icon={<Lumerin />} text='0.3241' />,
				limit: '0.0100',
				speed: 100,
				length: '4 hours',
				trade: BuyButton,
			},
			{
				id: <TableIcon icon={<Hashrate />} text={1} />,
				price: <TableIcon icon={<Lumerin />} text='0.3241' />,
				limit: '0.0100',
				speed: 100,
				length: '1 hour',
				trade: BuyButton,
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
	const classes = useStyles();

	return (
		<table {...getTableProps()} className={classNames(classes.table, 'm-auto mt-8 bg-lumerin-gray h-10')}>
			<thead className='bg-lumerin-dark-gray h-16'>
				{headerGroups.map((headerGroup) => (
					<tr {...headerGroup.getHeaderGroupProps()}>
						{headerGroup.headers.map((column) => (
							<th {...column.getHeaderProps()}>{column.render('Header')}</th>
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
									<td
										{...cell.getCellProps()}
										style={{
											padding: '0.625rem',
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
