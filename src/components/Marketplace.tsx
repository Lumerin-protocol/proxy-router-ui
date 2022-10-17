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
import { BuyerOrdersWidget } from './ui/Widgets/BuyerOrdersWidget';
import { WalletBalanceWidget } from './ui/Widgets/WalletBalanceWidget';

interface MarketplaceProps {
	web3: Web3 | undefined;
	contracts: HashRentalContract[];
	setContractId: Dispatch<SetStateAction<string>>;
	buyClickHandler: React.MouseEventHandler<HTMLButtonElement>;
	userAccount: string;
	isMetaMask: boolean;
	currentBlockTimestamp: number;
	lumerinBalance: number;
}

export const Marketplace: React.FC<MarketplaceProps> = ({
	web3,
	userAccount,
	isMetaMask,
	currentBlockTimestamp,
	lumerinBalance,
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

	const WidgetsWrapper = styled.div`
		display: flex;
		flex-wrap: wrap;
		margin-top: 2rem;
		margin-bottom: 2.5rem;
		width: 100%;
		column-gap: 1rem;
		row-gap: 1rem;

		.widget {
			display: flex;
			flex-direction: column;
			flex: 1 1 0px;
		}
	`;

	return (
		<>
			<WidgetsWrapper>
				<div className='card bg-white rounded-15 p-6 flex flex-col items-center justify-center text-sm w-96 h-32 flex-auto'>
					<p>
						Welcome to the Lumerin Marketplace Beta, please provide feedback or submit any bugs you
						notice to the{' '}
						<a
							className='link underline'
							href='https://github.com/Lumerin-protocol/proxy-router-ui/issues'
						>
							Github Repo.
						</a>
					</p>
				</div>
				<BuyerOrdersWidget
					isLoading={isLoading}
					contracts={contracts}
					userAccount={userAccount}
					currentBlockTimestamp={currentBlockTimestamp}
				/>
				{isMetaMask && <WalletBalanceWidget lumerinBalance={lumerinBalance} />}
			</WidgetsWrapper>
			<SortToolbar pageTitle='Hashrate For Sale' sortType={sortType} setSortType={setSortType} />
			<AvailableContracts contracts={availableContracts} loading={isLoading} />
		</>
	);
};

Marketplace.displayName = 'Marketplace';
Marketplace.whyDidYouRender = false;
