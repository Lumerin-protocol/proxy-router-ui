import React, { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import { ReactComponent as Lumerin } from '../images/lumerin.svg';
import { Column, useTable } from 'react-table';
import { TableIcon } from './ui/TableIcon';
import { BuyButton } from './ui/BuyButton';
import { Table } from './ui/Table';
import { AddressLength, getLengthDisplay, truncateAddress } from '../utils';

export interface MarketPlaceData {
	id?: JSX.Element | string;
	price?: JSX.Element | string;
	limit?: string;
	speed?: number;
	length?: string;
	trade?: JSX.Element | string;
}

interface Header {
	Header?: string;
	accessor?: string;
}

// This interface needs to have all the properties for both data and columns based on index.d.ts
interface CustomTableOptions extends MarketPlaceData, Header {}

interface MarketplaceProps {
	contracts: MarketPlaceData[];
	setContractId: Dispatch<SetStateAction<string>>;
	buyClickHandler: React.MouseEventHandler<HTMLButtonElement>;
}

export const Marketplace: React.FC<MarketplaceProps> = ({ contracts, setContractId, buyClickHandler }) => {
	const [isLargeBreakpointOrGreater, setIsLargeBreakpointOrGreater] = useState<boolean>(true);

	// Adjust contract address length when breakpoint > lg
	const mediaQueryList = window.matchMedia('(min-width: 1024px)');
	// Not an arrow function since parameter is typed as this and arrow function can't have this as parameter
	function mediaQueryListOnChangeHandler(this: MediaQueryList, ev: MediaQueryListEvent): any {
		if (this.matches && !isLargeBreakpointOrGreater) {
			setIsLargeBreakpointOrGreater(true);
		} else if (isLargeBreakpointOrGreater) {
			setIsLargeBreakpointOrGreater(false);
		}
	}
	if (mediaQueryList) mediaQueryList.onchange = mediaQueryListOnChangeHandler;

	useEffect(() => {
		if (!mediaQueryList?.matches) {
			setIsLargeBreakpointOrGreater(false);
		} else {
			setIsLargeBreakpointOrGreater(true);
		}
	}, [mediaQueryList?.matches]);

	const getTableData: (contracts: MarketPlaceData[]) => MarketPlaceData[] = (contracts) => {
		const updatedContracts = contracts.map((contract) => {
			const updatedContract = { ...contract };
			if (Object.keys(contract).length !== 0) {
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
				updatedContract.price = <TableIcon icon={<Lumerin />} text={updatedContract.price as string} justify='start' />;
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
			{ Header: 'DURATION (W/D/H)', accessor: 'length' },
			{ Header: 'TRADE', accessor: 'trade' },
		],
		[]
	);

	const data = getTableData(contracts);
	const tableInstance = useTable<CustomTableOptions>({ columns, data });

	return (
		<div className='flex flex-col'>
			<div className='mt-8 flex flex-col items-center text-18'>
				<p>Welcome to the Lumerin Hashrate marketplace.</p>
				<p> Tap buy to purchase any of the contracts below.</p>
			</div>
			<Table id='marketplace' tableInstance={tableInstance} columnCount={6} />
		</div>
	);
};

Marketplace.displayName = 'Marketplace';
Marketplace.whyDidYouRender = false;
