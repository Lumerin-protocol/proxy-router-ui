import React, { Dispatch, SetStateAction, useMemo } from 'react';
import { ReactComponent as Hashrate } from '../images/hashrate.svg';
import { ReactComponent as Lumerin } from '../images/lumerin.svg';
import { Column, useTable } from 'react-table';
import { TableIcon } from './ui/TableIcon';
import { BuyButton } from './ui/BuyButton';
import { Table } from './ui/Table';
import { truncateAddress } from '../utils';

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
	const getTableData: (contracts: MarketPlaceData[]) => MarketPlaceData[] = (contracts) => {
		const updatedContracts = contracts.map((contract) => {
			const updatedContract = { ...contract };
			if (Object.keys(contract).length !== 0) {
				updatedContract.id = (
					<TableIcon icon={<Hashrate />} text={truncateAddress(updatedContract.id as string, true)} hasLink justify='start' />
				);
				updatedContract.price = <TableIcon icon={<Lumerin />} text={updatedContract.price as string} justify='center' />;
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
			{ Header: 'PRICE (ETH)', accessor: 'price' },
			{ Header: 'LIMIT (TH/S)', accessor: 'limit' },
			{ Header: 'SPEED (TH/S)', accessor: 'speed' },
			{ Header: 'LENGTH (HR/D/W)', accessor: 'length' },
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
