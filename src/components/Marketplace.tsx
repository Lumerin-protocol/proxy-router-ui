/* eslint-disable react-hooks/exhaustive-deps */
import React, { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import { TableIcon } from './ui/TableIcon';
import { BuyButton } from './ui/Forms/FormButtons/BuyButton';
import { AvailableContracts } from './ui/Cards/AvailableContracts';
import { setMediaQueryListOnChangeHandler } from '../utils';
import { Spinner } from './ui/Spinner.styled';
import { ContractState, HashRentalContract } from '../types';
import { useInterval } from './hooks/useInterval';
import Web3 from 'web3';
import { divideByDigits } from '../web3/helpers';
import _ from 'lodash';

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

	const data = useMemo(() => getTableData(), [contracts, isLargeBreakpointOrGreater]);

	// Remove spinner if no contracts after 1 minute
	useInterval(() => {
		if (showSpinner) setShowSpinner(false);
	}, 7000);

	useEffect(() => {
		if (data.length > 0) {
			setShowSpinner(false);
		}
	});

	return (
		<>
			{!showSpinner && (
				<h2 className='text-lg text-lumerin-blue-text font-Raleway font-regular text-left mb-5'>
					Hashrate For Sale
				</h2>
			)}
			{showSpinner && (
				<div className='spinner'>
					<Spinner />
				</div>
			)}
			<div className='flex flex-col'>
				{data.length > 0 && <AvailableContracts contracts={data} />}
				{data.length === 0 && !showSpinner && (
					<div className='text-2xl text-lumerin-black-text'>
						There are no available contracts for purchase.
					</div>
				)}
			</div>
		</>
	);
};

Marketplace.displayName = 'Marketplace';
Marketplace.whyDidYouRender = false;
