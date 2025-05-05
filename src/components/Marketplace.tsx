/* eslint-disable react-hooks/exhaustive-deps */
import React, { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import { AvailableContracts } from './ui/Cards/AvailableContracts';
import { setMediaQueryListOnChangeHandler } from '../utils';
import { ContractState, HashRentalContract } from '../types';
import { useInterval } from './hooks/useInterval';
import styled from '@emotion/styled';
import { BuyerOrdersWidget } from './ui/Widgets/BuyerOrdersWidget';
import { WalletBalanceWidget } from './ui/Widgets/WalletBalanceWidget';
import { sortContracts } from '../utils';
import { MobileWalletInfo } from './ui/Widgets/MobileWalletInfo';
import { MessageWidget } from './ui/Widgets/MessageWidget';
import { MarketplaceStatistics } from './ui/Widgets/MarketplaceStatistics';
import { Rates } from '../rates/interfaces';

interface MarketplaceProps {
	contracts: HashRentalContract[];
	setContractId: Dispatch<SetStateAction<string>>;
	buyClickHandler: React.MouseEventHandler<HTMLButtonElement>;
	userAccount: string;
	isMetaMask: boolean;
	currentBlockTimestamp: number;
	lumerinBalance: number;
	ethBalance: number;
	usdcBalance: number;
	isMobile: boolean;
	rates: Rates | undefined;
}

export const Marketplace: React.FC<MarketplaceProps> = ({
	userAccount,
	isMetaMask,
	currentBlockTimestamp,
	lumerinBalance,
	ethBalance,
	usdcBalance,
	contracts,
	rates,
	setContractId,
	buyClickHandler,
	isMobile,
}) => {
	const [isLargeBreakpointOrGreater, setIsLargeBreakpointOrGreater] = useState<boolean>(true);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [sortType, setSortType] = useState('');

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

	const availableContracts = useMemo(() => {
		const usersAvailableContracts = contracts.filter(
			(contract) => contract.state === ContractState.Available && contract.seller !== userAccount
		);
		return sortContracts(sortType, usersAvailableContracts);
	}, [contracts, userAccount, sortType]);

	// Remove spinner if no contracts after 1 minute
	useInterval(() => {
		if (isLoading) setIsLoading(false);
	}, 7000);

	useEffect(() => {
		if (contracts.length > 0) {
			setIsLoading(false);
		}
	});

	return (
		<>
			{!isMobile ? (
				<>
					<WidgetsWrapper>
						<MessageWidget isMobile={isMobile} />
						{isMetaMask && (
							<WalletBalanceWidget
								lumerinBalance={lumerinBalance}
								rates={rates}
								isMobile={isMobile}
								ethBalance={ethBalance}
								usdcBalance={usdcBalance}
							/>
						)}
						<BuyerOrdersWidget
							isLoading={isLoading}
							contracts={contracts}
							userAccount={userAccount}
							currentBlockTimestamp={currentBlockTimestamp}
						/>
						<MarketplaceStatistics isLoading={isLoading} contracts={contracts} />
					</WidgetsWrapper>
					<AvailableContracts
						contracts={availableContracts}
						loading={isLoading}
						setSortType={setSortType}
						sortType={sortType}
						setContractId={setContractId}
						buyClickHandler={buyClickHandler}
					/>
				</>
			) : (
				<>
					<MobileWidgetsWrapper>
						<div className='widget-row'>
							<MobileWalletInfo walletAddress={userAccount} isMobile={isMobile} />
							{isMetaMask && (
								<WalletBalanceWidget
									lumerinBalance={lumerinBalance}
									isMobile={isMobile}
									ethBalance={ethBalance}
									rates={rates}
									usdcBalance={usdcBalance}
								/>
							)}
						</div>
					</MobileWidgetsWrapper>
					<MessageWidget isMobile={isMobile} />
					<AvailableContracts
						contracts={availableContracts}
						loading={isLoading}
						setSortType={setSortType}
						sortType={sortType}
						setContractId={setContractId}
						buyClickHandler={buyClickHandler}
					/>
				</>
			)}
		</>
	);
};

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

const MobileWidgetsWrapper = styled.div`
	.widget-row {
		display: flex;
		flex-direction: row;
		gap: 1rem;
		margin-bottom: 1rem;
		margin-top: 1rem;
	}
`;
