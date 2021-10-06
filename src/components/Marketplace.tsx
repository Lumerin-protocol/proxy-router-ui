import React, { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import { ReactComponent as Hashrate } from '../images/hashrate.svg';
import { ReactComponent as Lumerin } from '../images/lumerin.svg';
import { Column, useTable } from 'react-table';
import { TableIcon } from './ui/TableIcon';
import { BuyButton } from './ui/BuyButton';
import { Table } from './ui/Table';
import { AddressLength, truncateAddress } from '../utils';

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

	enum Unit {
		Hour = 'H',
		Day = 'D',
		Week = 'W',
	}

	const getLengthDisplay: (length: number) => string = (length) => {
		// Test contract returning less than an hr so use multiplier
		// TODO: remove when contracts updated
		length = length * 10000;
		const secondsInHour = 3600;
		// Smallest unit to display is an hour since min contract duration is 1 hour
		const weeks = Math.floor(length / (secondsInHour * 24 * 7));
		const days = Math.floor(length / (secondsInHour * 24));
		const hours = Math.floor((length % (secondsInHour * 24)) / secondsInHour);
		if (weeks === 0) {
			if (days === 0) return `${hours}${Unit.Hour}`;
			if (hours === 0) return `${days}${Unit.Day}`;
			return `${days}${Unit.Day} / ${hours}${Unit.Hour}`;
		}
		return `${weeks}${Unit.Week} / ${days}${Unit.Day} / ${hours}${Unit.Hour}`;
	};

	const getTableData: (contracts: MarketPlaceData[]) => MarketPlaceData[] = (contracts) => {
		const updatedContracts = contracts.map((contract) => {
			const updatedContract = { ...contract };
			if (Object.keys(contract).length !== 0) {
				updatedContract.id = (
					<TableIcon
						icon={<Hashrate />}
						text={
							isLargeBreakpointOrGreater
								? truncateAddress(updatedContract.id as string)
								: truncateAddress(updatedContract.id as string, AddressLength.short)
						}
						hasLink
						justify='start'
					/>
				);
				updatedContract.price = <TableIcon icon={<Lumerin />} text={updatedContract.price as string} justify='center' />;
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
			{ Header: 'LIMIT (TH/S)', accessor: 'limit' },
			{ Header: 'SPEED (TH/S)', accessor: 'speed' },
			{ Header: 'DURATION (W/D/H)', accessor: 'length' },
			{ Header: 'TRADE', accessor: 'trade' },
		],
		[]
	);

	const data = getTableData(contracts);
	const tableInstance = useTable<CustomTableOptions>({ columns, data });

	return <Table id='marketplace' tableInstance={tableInstance} columnCount={6} />;
};

Marketplace.displayName = 'Marketplace';
Marketplace.whyDidYouRender = false;
