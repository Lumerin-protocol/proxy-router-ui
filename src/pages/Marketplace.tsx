/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useMemo, useState } from 'react';
import { TableIcon } from '../components/ui/TableIcon';
import { BuyButton } from '../components/ui/Forms/FormButtons/BuyButton';
import { AvailableContracts } from '../components/ui/Cards/AvailableContracts';
import { setMediaQueryListOnChangeHandler, sortContractsV2 } from '../utils';
import { ContractState, HashRentalContract, SortTypes } from '../types';
import { useInterval } from '../hooks/useInterval';
import { divideByDigits } from '../web3/helpers';
import _ from 'lodash';
import styled from '@emotion/styled';
import { BuyerOrdersWidget } from '../components/ui/Widgets/BuyerOrdersWidget';
import { WalletBalanceWidget } from '../components/ui/Widgets/WalletBalanceWidget';
import { MobileWalletInfo } from '../components/ui/Widgets/MobileWalletInfo';
import { MessageWidget } from '../components/ui/Widgets/MessageWidget';
import { ModalItem } from '../components/ui/Modal';
import { BuyForm } from '../components/ui/Forms/BuyerForms/BuyForm';
import { EthereumGateway } from '../gateway/ethereum';
import { Sort } from '@mui/icons-material';

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

interface MarketplaceProps {
	web3Gateway?: EthereumGateway;
	contracts: HashRentalContract[];
	userAccount: string;
	currentBlockTimestamp: number;
	lumerinBalance: number;
	isMobile: boolean;
}

export const Marketplace: React.FC<MarketplaceProps> = ({
	web3Gateway,
	userAccount,
	currentBlockTimestamp,
	lumerinBalance,
	contracts,
	isMobile,
}) => {
	const [isLargeBreakpointOrGreater, setIsLargeBreakpointOrGreater] = useState<boolean>(true);
	const [isLoading, setIsLoading] = useState<boolean>(true);

	const [buyModalOpen, setBuyModalOpen] = useState<boolean>(false);
	const [buyModalContractId, setBuyModalContractId] = useState<string>('');

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
			(contract) =>
				(contract.state as string) === ContractState.Available && contract.seller !== userAccount
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
						setContractId={setBuyModalContractId}
						buyClickHandler={() => setBuyModalOpen(true)}
					/>
				);
			}
			return updatedContract;
		});

		return updatedContracts;
	};

	const data = useMemo(() => getTableData(), [contracts, isLargeBreakpointOrGreater]);

	const [sortType, setSortType] = useState(SortTypes.Default);
	const availableContracts = sortContractsV2(sortType, data);

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
			<ModalItem
				open={buyModalOpen}
				onClose={() => setBuyModalOpen(false)}
				content={
					<BuyForm
						contracts={contracts}
						contractId={buyModalContractId}
						userAccount={userAccount}
						web3Gateway={web3Gateway}
						lumerinbalance={lumerinBalance}
						onClose={() => setBuyModalOpen(false)}
					/>
				}
			/>

			{!isMobile ? (
				<>
					<WidgetsWrapper>
						<MessageWidget isMobile={isMobile} />
						<BuyerOrdersWidget
							isLoading={isLoading}
							contracts={contracts}
							userAccount={userAccount}
							currentBlockTimestamp={currentBlockTimestamp}
						/>
						<WalletBalanceWidget lumerinBalance={lumerinBalance} isMobile={isMobile} />
					</WidgetsWrapper>
					{/* <SortToolbar
						pageTitle='Hashrate For Sale'
						sortType={sortType}
						setSortType={setSortType}
						isMobile={isMobile}
					/> */}
					<AvailableContracts
						contracts={availableContracts}
						loading={isLoading}
						setSortType={setSortType}
						sortType={sortType}
					/>
				</>
			) : (
				<>
					<MobileWidgetsWrapper>
						<div className='widget-row'>
							<MobileWalletInfo walletAddress={userAccount} isMobile={isMobile} />
							<WalletBalanceWidget lumerinBalance={lumerinBalance} isMobile={isMobile} />
						</div>
					</MobileWidgetsWrapper>
					<MessageWidget isMobile={isMobile} />
					{/* <SortToolbar
						pageTitle='Hashrate For Sale'
						sortType={sortType}
						setSortType={setSortType}
						isMobile={isMobile}
					/> */}
					<AvailableContracts
						contracts={availableContracts}
						loading={isLoading}
						setSortType={setSortType}
						sortType={sortType}
					/>
				</>
			)}
		</>
	);
};

Marketplace.displayName = 'Marketplace';
Marketplace.whyDidYouRender = false;
