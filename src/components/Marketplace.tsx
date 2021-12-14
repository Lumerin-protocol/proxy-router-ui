/* eslint-disable react-hooks/exhaustive-deps */
import React, { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import { Column, useTable, useSortBy, SortByFn, Row } from 'react-table';
import { TableIcon } from './ui/TableIcon';
import { BuyButton } from './ui/Forms/FormButtons/BuyButton';
import { Table } from './ui/Table';
import { getLengthDisplay, setMediaQueryListOnChangeHandler, sortByInt } from '../utils';
import { Spinner } from './ui/Spinner';
import { ContractState, HashRentalContract, Header } from '../types';
import { useInterval } from './hooks/useInterval';
import _ from 'lodash';

// This interface needs to have all the properties for both data and columns based on index.d.ts
interface CustomTableOptions extends HashRentalContract, Header {}

interface MarketplaceProps {
	contracts: HashRentalContract[];
	setContractId: Dispatch<SetStateAction<string>>;
	buyClickHandler: React.MouseEventHandler<HTMLButtonElement>;
}

export const Marketplace: React.FC<MarketplaceProps> = ({ contracts, setContractId, buyClickHandler }) => {
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

	const getTableData: (contracts: HashRentalContract[]) => HashRentalContract[] = (contracts) => {
		const availableContracts = contracts.filter((contract) => (contract.state as string) === ContractState.Available);
		// Add emtpy row for styling
		availableContracts.unshift({});
		const updatedContracts = availableContracts.map((contract) => {
			const updatedContract = { ...contract };
			if (!_.isEmpty(contract)) {
				updatedContract.id = (
					<TableIcon
						icon={null}
						isLargeBreakpointOrGreater={isLargeBreakpointOrGreater}
						text={updatedContract.id as string}
						hasLink
						justify='start'
					/>
				);
				updatedContract.length = getLengthDisplay(parseInt(updatedContract.length as string));
				updatedContract.trade = (
					<BuyButton contractId={contract.id as string} setContractId={setContractId} buyClickHandler={buyClickHandler} />
				);
			}
			return updatedContract;
		});

		return updatedContracts;
	};

	const customSort: any = (rowA: Row, rowB: Row, columnId: string, desc: boolean) => {
		if (_.isEmpty(rowA.original)) {
			return desc ? 1 : -1;
		}
		if (_.isEmpty(rowB.original)) {
			return desc ? -1 : 1;
		}

		switch (columnId) {
			case 'price':
				return sortByInt(rowA.values.price, rowB.values.price);
			case 'speed':
				return sortByInt(rowA.values.speed, rowB.values.speed);
			case 'length':
				return sortByInt(rowA.values.length, rowB.values.length);
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
			{ Header: 'PRICE (LMR)', accessor: 'price', sortType: 'customSort' },
			{ Header: 'SPEED (TH/S)', accessor: 'speed', sortType: 'customSort' },
			{ Header: 'DURATION (DAYS)', accessor: 'length', sortType: 'customSort' },
			{ Header: 'TRADE', accessor: 'trade', disableSortBy: true },
		],
		[]
	);

	const data = useMemo(() => getTableData(contracts), [contracts]);
	const tableInstance = useTable<CustomTableOptions>({ columns, data, sortTypes }, useSortBy);

	// Remove spinner if no contracts after 1 minute
	useInterval(() => {
		if (showSpinner) setShowSpinner(false);
	}, 60000);

	// There is always 1 empty contract for styling purposes
	return (
		<div className='flex flex-col'>
			{data.length > 1 ? (
				<Table id='marketplace' tableInstance={tableInstance} columnCount={6} isLargeBreakpointOrGreater={isLargeBreakpointOrGreater} />
			) : null}
			{data.length === 1 && showSpinner ? (
				<div className='flex justify-center mt-50 mr-50'>
					<Spinner />
				</div>
			) : null}
			{data.length === 1 && !showSpinner ? <div className='text-2xl'>There are no available contracts for purchase.</div> : null}
		</div>
	);
};

Marketplace.displayName = 'Marketplace';
Marketplace.whyDidYouRender = false;
