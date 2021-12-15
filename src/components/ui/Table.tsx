import React from 'react';
import { createUseStyles } from 'react-jss';
import { TableInstance } from 'react-table';
import { classNames } from '../../utils';
const { colors } = require('styles/styles.config.js');

// The use of `!important` is bc not dynamically checking the number of cells per row
const useStyles = createUseStyles({
	table: {
		'&': {
			borderSpacing: 0,
			color: colors['lumerin-table-text-color'],
		},
		'& > thead > tr > th:hover': {
			backgroundColor: colors['lumerin-aqua'],
			color: 'white',
		},
		'& > thead > tr > th:first-child:hover': {
			backgroundColor: 'inherit',
			color: 'inherit',
		},
		'& > thead > tr > th:last-child:hover': {
			backgroundColor: 'inherit',
			color: 'inherit',
		},
		'& > thead > tr > th:first-child': {
			border: '0px solid transparent',
			borderRadius: '5px 0 0 5px',
		},
		'& > thead > tr > th:last-child': {
			borderRadius: '0 5px 5px 0',
		},
		'& > tbody > tr:first-child': {
			height: '32px',
			pointerEvents: 'none',
		},
		'& > tbody > tr:first-child > td': {
			border: 'none',
		},
		'& > tbody > tr:first-child > td:last-child': {
			borderRight: 'none !important',
		},
		'& > tbody > tr > td': {
			backgroundColor: 'white',
			border: `1px solid ${colors['lumerin-gray']}`,
			borderBottom: 'none',
		},
		'& > tbody > tr > td:first-child': {
			borderRight: 'none',
		},
		'& > tbody > tr > td:first-child:hover': {
			backgroundColor: colors['lumerin-aqua'],
			color: 'white',
		},
		'& > tbody > tr > td:last-child': {
			borderLeft: 'none',
			borderRight: `1px solid ${colors['lumerin-gray']} !important`,
		},
		'& > tbody > tr > td:nth-child(2)': {
			borderLeft: 'none',
			borderRight: 'none',
		},
		'& > tbody > tr:nth-child(2) > td:first-child': {
			borderTopLeftRadius: '5px',
		},
		'& > tbody > tr:nth-child(2) > td:last-child': {
			borderTopRightRadius: '5px',
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
		'& > tbody > tr > td:nth-child(6)': {
			borderLeft: 'none',
			borderRight: 'none',
		},
		'& > tbody > tr:last-child > td': {
			borderBottom: `1px solid ${colors['lumerin-gray']}`,
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
	columnCount: number;
	isLargeBreakpointOrGreater: boolean;
}

export const Table: React.FC<TableProps> = ({ id, tableInstance, columnCount, isLargeBreakpointOrGreater }) => {
	const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = tableInstance;
	const paddingLeft = isLargeBreakpointOrGreater ? 'pl-8' : 'pl-4';
	const classes = useStyles();

	return (
		<table id={id} {...getTableProps()} className={classNames(classes.table, 'w-99 relative border-separate h-10')}>
			<thead className='bg-lumerin-dark-gray h-16 text-xs'>
				{headerGroups.map((headerGroup) => (
					<tr {...headerGroup.getHeaderGroupProps()}>
						{headerGroup.headers.map((column) => (
							<th
								{...column.getHeaderProps(column.getSortByToggleProps())}
								className={`sticky ${paddingLeft} text-justify top-0 bg-lumerin-dark-gray`}
								style={{
									width: `${Math.floor(100 / columnCount)}%`,
									cursor: column.id !== 'id' && column.id !== 'editCancel' && column.id !== 'trade' ? 'pointer' : 'text',
								}}
							>
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
						<tr {...row.getRowProps()} className='h-75 text-center'>
							{row.cells.map((cell) => {
								return (
									<td {...cell.getCellProps()} className={`${paddingLeft} text-justify font-semibold text-sm`}>
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
