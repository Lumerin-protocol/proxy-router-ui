import { Dispatch, MouseEventHandler, SetStateAction, useEffect, useMemo, useState } from 'react';
import { Column, useTable } from 'react-table';
import { ContractData, HashRentalContract, Header } from '../types';
import { getLengthDisplay, getProgressDiv, getStatusDiv, setMediaQueryListOnChangeHandler } from '../utils';
import { Table } from './ui/Table';
import { TableIcon } from './ui/TableIcon';
import { DateTime } from 'luxon';
import _ from 'lodash';
import { EditCancelButtonGroup } from './ui/Forms/FormButtons/EditCancelButtonGroup';

// This interface needs to have all the properties for both data and columns based on index.d.ts
interface CustomTableOptions extends ContractData, Header {}

interface MyContractsProps {
	userAccount: string;
	contracts: HashRentalContract[];
	currentBlockTimestamp: number;
	setContractId: Dispatch<SetStateAction<string>>;
	editClickHandler: MouseEventHandler<HTMLButtonElement>;
	cancelClickHandler: MouseEventHandler<HTMLButtonElement>;
}

export const MyContracts: React.FC<MyContractsProps> = ({
	userAccount,
	contracts,
	currentBlockTimestamp,
	setContractId,
	editClickHandler,
	cancelClickHandler,
}) => {
	const [isLargeBreakpointOrGreater, setIsLargeBreakpointOrGreater] = useState<boolean>(true);

	// Adjust contract address length when breakpoint > lg
	const mediaQueryList = window.matchMedia('(min-width: 1200px)');
	setMediaQueryListOnChangeHandler(mediaQueryList, isLargeBreakpointOrGreater, setIsLargeBreakpointOrGreater);

	useEffect(() => {
		if (!mediaQueryList?.matches) {
			setIsLargeBreakpointOrGreater(false);
		} else {
			setIsLargeBreakpointOrGreater(true);
		}
	}, [mediaQueryList?.matches]);

	useEffect(() => {
		if (!mediaQueryList?.matches) {
			setIsLargeBreakpointOrGreater(false);
		} else {
			setIsLargeBreakpointOrGreater(true);
		}
	}, [mediaQueryList?.matches]);

	const getTimestamp: (timestamp: string) => string = (timestamp) => {
		if (timestamp === '0') return '_____';
		return DateTime.fromSeconds(parseInt(timestamp)).toFormat('MM/dd/yyyy hh:mm:ss');
	};
	const getTableData: () => ContractData[] = () => {
		const sellerContracts = contracts.filter((contract) => contract.seller === userAccount);
		// Add emtpy row for styling
		sellerContracts.unshift({});
		const updatedOrders = sellerContracts.map((contract) => {
			const updatedOrder = { ...contract } as ContractData;
			if (!_.isEmpty(contract)) {
				updatedOrder.id = (
					<TableIcon
						icon={null}
						isLargeBreakpointOrGreater={isLargeBreakpointOrGreater}
						text={updatedOrder.id as string}
						hasLink
						justify='start'
					/>
				);
				updatedOrder.status = getStatusDiv(updatedOrder.state as string);
				updatedOrder.progress = getProgressDiv(
					updatedOrder.state as string,
					updatedOrder.timestamp as string,
					parseInt(updatedOrder.length as string),
					currentBlockTimestamp
				);
				updatedOrder.length = getLengthDisplay(parseInt(updatedOrder.length as string));
				updatedOrder.timestamp = getTimestamp(contract.timestamp as string);
				updatedOrder.editCancel = (
					<EditCancelButtonGroup
						contractId={contract.id as string}
						setContractId={setContractId}
						editClickHandler={editClickHandler}
						cancelClickHandler={cancelClickHandler}
					/>
				);
			}
			return updatedOrder as ContractData;
		});

		return updatedOrders;
	};
	const columns: Column<CustomTableOptions>[] = useMemo(
		() => [
			{ Header: 'CONTRACT ADDRESS', accessor: 'id' },
			{ Header: 'STATUS', accessor: 'status' },
			{ Header: 'PRICE (LMR)', accessor: 'price' },
			{ Header: 'DURATION (DAYS)', accessor: 'length' },
			{ Header: 'STARTED', accessor: 'timestamp' },
			{ Header: 'PROGRESS', accessor: 'progress' },
			{ Header: '', accessor: 'editCancel' },
		],
		[]
	);

	const data = getTableData();
	const tableInstance = useTable<CustomTableOptions>({ columns, data });

	return <Table id='mycontracts' tableInstance={tableInstance} columnCount={6} isLargeBreakpointOrGreater={isLargeBreakpointOrGreater} />;
};

MyContracts.displayName = 'MyContracts';
MyContracts.whyDidYouRender = false;
