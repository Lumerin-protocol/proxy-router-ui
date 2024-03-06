import React, { useMemo, useState } from 'react';
import { TableIcon } from '../components/ui/TableIcon';
import { BuyButton } from '../components/ui/Forms/FormButtons/BuyButton';
import { AvailableContracts } from '../components/ui/Cards/AvailableContracts';
import { sortContractsV2 } from '../utils';
import { ContractState, HashRentalContract, SortTypes } from '../types';
import { divideByDigits } from '../web3/helpers';
import isEmpty from 'lodash/isEmpty';
import styled from '@emotion/styled';
import { BuyerOrdersWidget } from '../components/ui/Widgets/BuyerOrdersWidget';
import { WalletBalanceWidget } from '../components/ui/Widgets/WalletBalanceWidget';
import { MobileWalletInfo } from '../components/ui/Widgets/MobileWalletInfo';
import { MessageWidget } from '../components/ui/Widgets/MessageWidget';
import { ModalItem } from '../components/ui/Modal';
import { BuyForm } from '../components/ui/Forms/BuyerForms/BuyForm';
import { useMediaQuery } from '../hooks/useMediaQuery';

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
	contracts: HashRentalContract[] | null;
	userAccount: string;
	lumerinBalance: number | null;
	isMobile: boolean;
	refreshContracts: () => void;
}

export const Marketplace: React.FC<MarketplaceProps> = ({
	userAccount,
	contracts,
	isMobile,
	lumerinBalance,
	refreshContracts,
}) => {
	const [buyModalOpen, setBuyModalOpen] = useState<boolean>(false);
	const [buyModalContractId, setBuyModalContractId] = useState<string>('');

	// Adjust contract address length when breakpoint > lg
	const isLargeBreakpointOrGreater = useMediaQuery('(min-width: 1200px)');

	const getTableData: () => HashRentalContract[] = () => {
		const filteredContracts = contracts
			? contracts.filter(
					(contract) =>
						(contract.state as string) === ContractState.Available &&
						contract.seller !== userAccount
			  )
			: [];
		const updatedContracts = filteredContracts.map((contract: any) => {
			const updatedContract = { ...contract };
			if (!isEmpty(contract)) {
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

	const contract = contracts?.find((contract) => contract.id === buyModalContractId) || null;
	return (
		<>
			<ModalItem
				open={buyModalOpen}
				onClose={() => setBuyModalOpen(false)}
				content={
					contract && (
						<BuyForm
							contract={contract}
							userAccount={userAccount}
							lumerinbalance={lumerinBalance}
							onClose={() => setBuyModalOpen(false)}
							onPurchase={() => refreshContracts()}
						/>
					)
				}
			/>

			{!isMobile ? (
				<>
					<WidgetsWrapper>
						<MessageWidget isMobile={isMobile} />
						<BuyerOrdersWidget
							isLoading={!contracts}
							contracts={contracts || []}
							userAccount={userAccount}
						/>
						<WalletBalanceWidget lumerinBalance={lumerinBalance} isMobile={isMobile} />
					</WidgetsWrapper>
					<AvailableContracts
						contracts={availableContracts}
						loading={!contracts}
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
					<AvailableContracts
						contracts={availableContracts}
						loading={!contracts}
						setSortType={setSortType}
						sortType={sortType}
					/>
				</>
			)}
		</>
	);
};
