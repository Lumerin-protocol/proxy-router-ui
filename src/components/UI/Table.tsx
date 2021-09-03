import React from 'react';
import { createUseStyles } from 'react-jss';
import { TableInstance } from 'react-table';
import { classNames } from '../../utils';

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
			cursor: 'pointer',
		},
		'& > tbody > tr > td:first-child:hover': {
			backgroundColor: '#11B4BF',
			color: 'white',
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
			borderRight: '1px solid #E5E7EB',
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

interface TableProps {
	id: string;
	tableInstance: TableInstance;
}

export const Table: React.FC<TableProps> = ({ id, tableInstance }) => {
	const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = tableInstance;
	const classes = useStyles();

	return (
		<table id={id} {...getTableProps()} className={classNames(classes.table, 'w-99 mt-10 relative border-separate h-10 font-Inter')}>
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

Table.displayName = 'Table';
Table.whyDidYouRender = false;
