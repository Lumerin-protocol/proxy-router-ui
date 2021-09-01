import React, { Dispatch, SetStateAction, useCallback, useMemo } from 'react';
import { createUseStyles } from 'react-jss';
import { classNames, truncateAddress } from '../utils';
import { ReactComponent as Hashrate } from '../images/hashrate.svg';
import { ReactComponent as Lumerin } from '../images/lumerin.svg';
import { TableIcon } from './ui/TableIcon';
import { Column, useTable } from 'react-table';
import { BuyButton } from './ui/BuyButton';

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
		'& > tbody > tr > td:nth-child(5)': {
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
	setContractId: Dispatch<SetStateAction<string>>;
	buyClickHandler: React.MouseEventHandler<HTMLButtonElement>;
}

export const Marketplace: React.FC<MarketplaceProps> = ({ contracts, setContractId, buyClickHandler }) => {
	const getTableData: (contracts: Data[]) => Data[] = useCallback(
		(contracts) => {
			const updatedContracts = contracts.map((contract) => {
				const updatedContract = { ...contract };
				if (Object.keys(contract).length !== 0 && typeof contract.id === 'string') {
					updatedContract.id = <TableIcon icon={<Hashrate />} text={truncateAddress(updatedContract.id as string, true)} justify='start' />;
					updatedContract.price = <TableIcon icon={<Lumerin />} text={updatedContract.price as string} justify='center' />;
					updatedContract.trade = <BuyButton contractId={contract.id} setContractId={setContractId} buyClickHandler={buyClickHandler} />;
				}
				return updatedContract;
			});

			return updatedContracts;
		},
		[setContractId, buyClickHandler]
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
			{ Header: 'PRICE (ETH)', accessor: 'price' },
			{ Header: 'LIMIT (TH/S)', accessor: 'limit' },
			{ Header: 'SPEED (TH/S)', accessor: 'speed' },
			{ Header: 'LENGTH (HR/D/W)', accessor: 'length' },
			{ Header: 'TRADE', accessor: 'trade' },
		],
		[]
	);

	const data = useMemo(() => getTableData(contracts), [contracts, getTableData]);
	const tableInstance = useTable<CustomTableOptions>({ columns, data });
	const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = tableInstance;
	const classes = useStyles();

	return (
		<table {...getTableProps()} className={classNames(classes.table, 'w-99 mt-10 relative border-separate h-10 font-Inter')}>
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
Marketplace.whyDidYouRender = false;
