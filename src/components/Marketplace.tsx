import React, { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import { Column, useTable } from 'react-table';
import { TableIcon } from './ui/TableIcon';
import { BuyButton } from './ui/BuyButton';
import { Table } from './ui/Table';
import { getLengthDisplay, setMediaQueryListOnChangeHandler, truncateAddress } from '../utils';
import { Spinner } from './ui/Spinner';
import { AddressLength, ContractState, HashRentalContract, Header } from '../types';
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
						text={
							isLargeBreakpointOrGreater
								? truncateAddress(updatedContract.id as string)
								: truncateAddress(updatedContract.id as string, AddressLength.SHORT)
						}
						hasLink
						justify='start'
					/>
				);
				updatedContract.price = <TableIcon icon={null} text={updatedContract.price as string} justify='start' />;
				updatedContract.length = getLengthDisplay(parseInt(updatedContract.length as string));
				updatedContract.trade = (
					<BuyButton contractId={contract.id as string} setContractId={setContractId} buyClickHandler={buyClickHandler} />
				);
			}
			return updatedContract;
		});

		return updatedContracts;
	};

	const columns: Column<CustomTableOptions>[] = useMemo(
		() => [
			{ Header: 'CONTRACT ADDRESS', accessor: 'id' },
			{ Header: 'PRICE (LMR)', accessor: 'price' },
			{ Header: 'SPEED (TH/S)', accessor: 'speed' },
			{ Header: 'DURATION (DAYS)', accessor: 'length' },
			{ Header: 'TRADE', accessor: 'trade' },
		],
		[]
	);

	const data = getTableData(contracts);
	const tableInstance = useTable<CustomTableOptions>({ columns, data });

	// There is always 1 empty contract for styling purposes
	return (
		<div className='flex flex-col'>
			{contracts.length > 1 ? (
				<Table id='marketplace' tableInstance={tableInstance} columnCount={6} isLargeBreakpointOrGreater={isLargeBreakpointOrGreater} />
			) : (
				<div className='flex justify-center mt-50 mr-50'>
					<Spinner />
				</div>
			)}
		</div>
	);
};

Marketplace.displayName = 'Marketplace';
Marketplace.whyDidYouRender = false;
