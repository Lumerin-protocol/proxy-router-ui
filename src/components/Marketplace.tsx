import { useMemo } from 'react';
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
			border: '0px solid transparent',
			borderRadius: '100px 0 0 100px',
			width: '20%',
		},
		// '& > thead > tr > th:nth-child(2)': {
		// 	width: '20%',
		// },
		// '& > thead > tr > th:nth-child(3)': {
		// 	width: '20%',
		// },
		// '& > thead > tr > th:nth-child(4)': {
		// 	width: '20%',
		// },
		// '& > tbody > tr:first-child': {
		// 	height: '20px',
		// },
		'& > tbody > tr:first-child > td': {
			backgroundColor: '#F2F5F9 !important',
		},
		'& > thead > tr > th:last-child': {
			border: '0px solid transparent',
			borderRadius: '0 100px 100px 0',
			width: '10%',
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
		'& > tbody > tr > td:nth-child(2)': {
			paddingLeft: 0,
		},
	},
});

export interface Data {
	id?: JSX.Element | string;
	price?: JSX.Element | string;
	limit?: string;
	speed?: number;
	length?: string;
	trade?: JSX.Element | string;
}

interface MarketplaceProps {
	contracts: Data[];
	buyClickHandler: React.MouseEventHandler<HTMLButtonElement>;
}

export const Marketplace: React.FC<MarketplaceProps> = ({ contracts, buyClickHandler }) => {
	const BuyButton = (
		<button type='button' className='w-20 h-8 rounded-xl p-auto bg-lumerin-aqua text-white font-medium' onClick={buyClickHandler}>
			<span>Buy</span>
		</button>
	);

	const getTableData: (contracts: Data[]) => Data[] = (contracts) => {
		contracts.forEach((contract) => {
			if (Object.keys(contract).length !== 0 && typeof contract.id === 'string') {
				contract.id = <TableIcon icon={<Hashrate />} text={truncateAddress(contract.id as string, true)} justify='start' />;
				contract.price = <TableIcon icon={<Lumerin />} text={contract.price as string} justify='center' />;
				contract.trade = BuyButton;
			}
		});
		// add empty row for styling
		if (Object.keys(contracts[0]).length !== 0) contracts.unshift({});

		return contracts;
	};

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

	const data = getTableData(contracts);
	const tableInstance = useTable<CustomTableOptions>({ columns, data });
	const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = tableInstance;
	const classes = useStyles();

	return (
		<table {...getTableProps()} className={classNames(classes.table, 'relative border-collapse m-auto mt-8 bg-lumerin-gray h-10 font-Inter')}>
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

Marketplace.displayName = 'Marketplace';
(Marketplace as any).whyDidYouRender = false;
