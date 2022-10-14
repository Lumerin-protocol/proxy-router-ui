/* eslint-disable react-hooks/exhaustive-deps */
import React, { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import { TableIcon } from './ui/TableIcon';
import { BuyButton } from './ui/Forms/FormButtons/BuyButton';
import { AvailableContracts } from './ui/Cards/AvailableContracts';
import { Box, FormControl, InputLabel, MenuItem, Select, Toolbar } from '@mui/material';
import { setMediaQueryListOnChangeHandler, sortContracts } from '../utils';
import { ContractState, HashRentalContract, SortTypes } from '../types';
import { useInterval } from './hooks/useInterval';
import Web3 from 'web3';
import { divideByDigits } from '../web3/helpers';
import _ from 'lodash';
import styled from '@emotion/styled';
import { SortToolbar } from './ui/SortToolbar';

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
	const [isLoading, setIsLoading] = useState<boolean>(true);

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
		const filteredContracts = contracts.filter(
			(contract) => (contract.state as string) === ContractState.Available
		);
		const updatedContracts = filteredContracts.map((contract: any) => {
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
				updatedContract.speed = Number(updatedContract.speed) / 10 ** 12;
				updatedContract.length = parseInt(updatedContract.length as string) / 3600;
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

	const data = useMemo(() => getTableData(), [contracts, isLargeBreakpointOrGreater]);

	const [availableContracts, setAvailableContracts] = useState<Array<object>>([...data]);
	const [sortType, setSortType] = useState('');

	useEffect(() => {
		sortContracts(sortType, availableContracts, setAvailableContracts);
	}, [sortType]);

	// Remove spinner if no contracts after 1 minute
	useInterval(() => {
		if (isLoading) setIsLoading(false);
	}, 7000);

	useEffect(() => {
		if (data.length > 0) {
			setIsLoading(false);
		}
	});

	return (
		<>
			<SortToolbar pageTitle='Marketplace' sortType={sortType} setSortType={setSortType} />
			<AvailableContracts contracts={availableContracts} loading={isLoading} />
		</>
	);
};

Marketplace.displayName = 'Marketplace';
Marketplace.whyDidYouRender = false;
