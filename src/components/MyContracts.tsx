/* eslint-disable react-hooks/exhaustive-deps */
import { Dispatch, MouseEventHandler, SetStateAction, useEffect, useMemo, useState } from 'react';
import { Column, Row, SortByFn, useSortBy, useTable } from 'react-table';
import { ContractData, HashRentalContract, Header, SortByType } from '../types';
import { getLengthDisplay, getProgressDiv, getStatusDiv, setMediaQueryListOnChangeHandler, sortByNumber } from '../utils';
import { Table } from './ui/Table';
import { TableIcon } from './ui/TableIcon';
import { DateTime } from 'luxon';
import { Spinner } from './ui/Spinner';
import { useInterval } from './hooks/useInterval';
import { ButtonGroup } from './ui/ButtonGroup';
import { EditButton } from './ui/Forms/FormButtons/EditButton';
import { ClaimLmrButton } from './ui/Forms/FormButtons/ClaimLmrButton';
import Web3 from 'web3';
import { getContractPrice } from '../web3/helpers';
import _ from 'lodash';

// This interface needs to have all the properties for both data and columns based on index.d.ts
interface CustomTableOptions extends ContractData, Header {}

interface MyContractsProps {
	web3: Web3 | undefined;
	userAccount: string;
	contracts: HashRentalContract[];
	currentBlockTimestamp: number;
	setContractId: Dispatch<SetStateAction<string>>;
	editClickHandler: MouseEventHandler<HTMLButtonElement>;
	claimLmrClickHandler: MouseEventHandler<HTMLButtonElement>;
}

export const MyContracts: React.FC<MyContractsProps> = ({
	web3,
	userAccount,
	contracts,
	currentBlockTimestamp,
	setContractId,
	editClickHandler,
	claimLmrClickHandler,
}) => {
	const [isLargeBreakpointOrGreater, setIsLargeBreakpointOrGreater] = useState<boolean>(true);
	const [showSpinner, setShowSpinner] = useState<boolean>(true);

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
				updatedOrder.price = web3 ? getContractPrice(web3, updatedOrder.price as number) : updatedOrder.price;
				updatedOrder.status = getStatusDiv(updatedOrder.state as string);
				updatedOrder.progress = getProgressDiv(
					updatedOrder.state as string,
					updatedOrder.timestamp as string,
					parseInt(updatedOrder.length as string),
					currentBlockTimestamp
				);
				updatedOrder.length = getLengthDisplay(parseInt(updatedOrder.length as string));
				updatedOrder.timestamp = getTimestamp(contract.timestamp as string);
				updatedOrder.editClaim = (
					<ButtonGroup
						button1={<EditButton contractId={contract.id as string} setContractId={setContractId} editClickHandler={editClickHandler} />}
						button2={
							<ClaimLmrButton
								contractId={contract.id as string}
								setContractId={setContractId}
								claimLmrClickHandler={claimLmrClickHandler}
							/>
						}
					/>
				);
			}
			return updatedOrder as ContractData;
		});

		return updatedOrders;
	};

	// TODO: if same as <MyOrders /> pull out into util function
	const customSort: SortByFn<CustomTableOptions> = (rowA: Row, rowB: Row, columnId: string, desc?: boolean) => {
		if (_.isEmpty(rowA.original)) return desc ? 1 : -1;
		if (_.isEmpty(rowB.original)) return desc ? -1 : 1;

		switch (columnId) {
			case 'status':
				return sortByNumber(rowA.values.status.key, rowB.values.status.key, SortByType.Int);
			case 'price':
				return sortByNumber(rowA.values.price, rowB.values.price, SortByType.Int);
			case 'length':
				return sortByNumber(rowA.values.length, rowB.values.length, SortByType.Float);
			case 'started':
				return sortByNumber(rowA.values.timestamp, rowB.values.timestamp, SortByType.Int);
			case 'progress':
				return sortByNumber(rowA.values.progress.key, rowB.values.progress.key, SortByType.Int);
			default:
				return 0;
		}
	};

	const sortTypes: Record<string, SortByFn<CustomTableOptions>> = {
		customSort: customSort,
	};

	const columns: Column<CustomTableOptions>[] = useMemo(
		() => [
			{ Header: 'CONTRACT ADDRESS', accessor: 'id', disableSortBy: true },
			{ Header: 'STATUS', accessor: 'status', sortType: 'customSort' },
			{ Header: 'PRICE (LMR)', accessor: 'price', sortType: 'customSort' },
			{ Header: 'DURATION (DAYS)', accessor: 'length', sortType: 'customSort' },
			{ Header: 'STARTED', accessor: 'timestamp', sortType: 'customSort' },
			{ Header: 'PROGRESS', accessor: 'progress', sortType: 'customSort' },
			{ Header: '', accessor: 'editClaim', disableSortBy: true },
		],
		[]
	);

	const data = useMemo(() => getTableData(), [contracts, isLargeBreakpointOrGreater]);
	const tableInstance = useTable<CustomTableOptions>({ columns, data, sortTypes }, useSortBy);

	// Remove spinner if no contracts after 1 minute
	useInterval(() => {
		if (showSpinner) setShowSpinner(false);
	}, 120000);

	return (
		<div className='flex flex-col'>
			{data.length > 1 ? (
				<Table id='mycontracts' tableInstance={tableInstance} columnCount={6} isLargeBreakpointOrGreater={isLargeBreakpointOrGreater} />
			) : null}
			{data.length === 1 && showSpinner ? (
				<div className='flex justify-center mt-50 mr-50'>
					<Spinner />
				</div>
			) : null}
			{data.length === 1 && !showSpinner ? <div className='text-2xl'>You have no contracts.</div> : null}
		</div>
	);
};

MyContracts.displayName = 'MyContracts';
MyContracts.whyDidYouRender = false;
