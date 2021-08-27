import { useCallback, useEffect, useMemo } from 'react';
import { createUseStyles } from 'react-jss';
import { classNames, truncateAddress } from '../utils';
import { ReactComponent as Hashrate } from '../images/hashrate.svg';
import { ReactComponent as Lumerin } from '../images/lumerin.svg';
import { TableIcon } from './ui/TableIcon';
import { Column, useTable } from 'react-table';

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

interface MarketplaceProps {
	contracts: string[];
	buyClickHandler: React.MouseEventHandler<HTMLButtonElement>;
}

export const Marketplace: React.FC<MarketplaceProps> = ({ contracts, buyClickHandler }) => {
	interface Data {
		id?: JSX.Element | string;
		price?: JSX.Element | string;
		limit?: string;
		speed?: number;
		length?: string;
		trade?: JSX.Element | string;
	}

	const BuyButton = (
		<button type='button' className='w-20 h-8 rounded-xl p-auto bg-lumerin-aqua text-white font-medium' onClick={buyClickHandler}>
			<span>Buy</span>
		</button>
	);

	const getTableData: (contracts: string[]) => Data[] = useCallback((contracts) => {
		const tableData: Data[] = [];
		let data: Data = {};
		if (contracts.length > 0) {
			contracts.forEach((contract) => {
				data = {
					id: <TableIcon icon={<Hashrate />} text={truncateAddress(contract)} />,
					price: <TableIcon icon={<Lumerin />} text='0.3241' />,
					limit: '0.0100',
					speed: 100,
					length: '4 hours',
					trade: BuyButton,
				};
				tableData.push(data);
			});
			// insert empty row for styling
			tableData.unshift({});
		}

		return tableData;
	}, []);

	const data: Data[] = useMemo(() => getTableData(contracts), [getTableData, contracts]);

	useEffect(() => {}, [contracts]);

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
		<table {...getTableProps()} className={classNames(classes.table, 'm-auto mt-8 bg-lumerin-gray h-10 font-Inter')}>
			<thead className='bg-lumerin-dark-gray h-16 text-xs'>
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

Marketplace.displayName = 'Marketplace';
(Marketplace as any).whyDidYouRender = false;
