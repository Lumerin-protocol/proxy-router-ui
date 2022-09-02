/* eslint-disable react-hooks/exhaustive-deps */
import React, { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import { Column, useTable, useSortBy, SortByFn, Row } from 'react-table';
import { TableIcon } from './ui/TableIcon';
import { BuyButton } from './ui/Forms/FormButtons/BuyButton';
import { Table } from './ui/Table';
import { AvailableContracts } from './ui/AvailableContracts';
import { setMediaQueryListOnChangeHandler, sortByNumber } from '../utils';
import { Spinner } from './ui/Spinner';
import { ContractState, HashRentalContract, Header, SortByType } from '../types';
import { useInterval } from './hooks/useInterval';
import Web3 from 'web3';
import { divideByDigits } from '../web3/helpers';
import _ from 'lodash';

// This interface needs to have all the properties for both data and columns based on index.d.ts
interface CustomTableOptions extends HashRentalContract, Header {}

interface MarketplaceProps {
	web3: Web3 | undefined;
	contracts: HashRentalContract[];
	setContractId: Dispatch<SetStateAction<string>>;
	buyClickHandler: React.MouseEventHandler<HTMLButtonElement>;
}

export const Marketplace: React.FC<MarketplaceProps> = ({
	web3,
	contracts,
	setContractId,
	buyClickHandler,
}) => {
	const [isLargeBreakpointOrGreater, setIsLargeBreakpointOrGreater] = useState<boolean>(true);
	const [showSpinner, setShowSpinner] = useState<boolean>(true);

	// Adjust contract address length when breakpoint > lg
	const mediaQueryList = window.matchMedia('(min-width: 1200px)');
	setMediaQueryListOnChangeHandler(
		mediaQueryList,
		isLargeBreakpointOrGreater,
		setIsLargeBreakpointOrGreater
	);

	useEffect(() => {
		if (!mediaQueryList?.matches) {
			setIsLargeBreakpointOrGreater(false);
		} else {
			setIsLargeBreakpointOrGreater(true);
		}
	}, [mediaQueryList?.matches]);

	const getTableData: () => HashRentalContract[] = () => {
		const availableContracts = contracts.filter(
			(contract) => (contract.state as string) === ContractState.Available
		);
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
				updatedContract.price = divideByDigits(updatedContract.price as number);
				updatedContract.speed = String(Number(updatedContract.speed) / 10 ** 12);
				updatedContract.length = String(parseInt(updatedContract.length as string) / 3600);
				updatedContract.contractId = String(contract.id);
				updatedContract.trade = (
					<BuyButton
						contractId={contract.id as string}
						setContractId={setContractId}
						buyClickHandler={buyClickHandler}
					/>
				);
			}
			return updatedContract;
		});

		return updatedContracts;
	};

	const customSort: SortByFn<CustomTableOptions> = (
		rowA: Row,
		rowB: Row,
		columnId: string,
		desc?: boolean
	) => {
		if (_.isEmpty(rowA.original)) return desc ? 1 : -1;
		if (_.isEmpty(rowB.original)) return desc ? -1 : 1;

		switch (columnId) {
			case 'price':
				return sortByNumber(rowA.values.price, rowB.values.price, SortByType.Int);
			case 'speed':
				return sortByNumber(rowA.values.speed, rowB.values.speed, SortByType.Int);
			case 'length':
				return sortByNumber(rowA.values.length, rowB.values.length, SortByType.Float);
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
			{ Header: 'DURATION (HOURS)', accessor: 'length', sortType: 'customSort' },
			{ Header: 'TRADE', accessor: 'trade', disableSortBy: true },
		],
		[]
	);

	const data = useMemo(() => getTableData(), [contracts, isLargeBreakpointOrGreater]);

	// Remove spinner if no contracts after 1 minute
	useInterval(() => {
		if (showSpinner) setShowSpinner(false);
	}, 7000);

	// There is always 1 empty contract for styling purposes
	return (
		<>
			<h2 className='text-lg text-lumerin-blue-text font-Raleway font-bold text-left mb-5'>
				Hashrate For Sale
			</h2>
			<div className='flex flex-col items-center'>
				{data.length > 1 ? <AvailableContracts contracts={data} /> : null}
				{data.length === 1 && showSpinner ? (
					<div className='spinner'>
						<Spinner />
					</div>
				) : null}
				{data.length === 1 && !showSpinner ? (
					<div className='text-2xl'>There are no available contracts for purchase.</div>
				) : null}
			</div>
		</>
	);
};

Marketplace.displayName = 'Marketplace';
Marketplace.whyDidYouRender = false;
