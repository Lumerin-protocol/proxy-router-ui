import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import { Column, SortByFn, useSortBy, useTable } from 'react-table';
import { ContractData, ContractState, HashRentalContract, Header, SortByType } from '../types';
import {
	getProgressDiv,
	getProgressPercentage,
	getSecondsEpoch,
	getStatusDiv,
	setMediaQueryListOnChangeHandler,
	sortByNumber,
} from '../utils';
import { Table } from '../components/ui/Table';
import { TableIcon } from '../components/ui/TableIcon';
import { DateTime } from 'luxon';
import { Spinner } from '../components/ui/Spinner.styled';
import { useInterval } from '../hooks/useInterval';
import { ButtonGroup } from '../components/ui/ButtonGroup';
import { EditButton } from '../components/ui/Forms/FormButtons/EditButton';
import { ClaimLmrButton } from '../components/ui/Forms/FormButtons/ClaimLmrButton';
import { divideByDigits } from '../web3/helpers';
import { PrimaryButton } from '../components/ui/Forms/FormButtons/Buttons.styled';
import { Toolbar } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import styled from '@emotion/styled';
import { ModalItem } from '../components/ui/Modal';
import { EditForm as SellerEditForm } from '../components/ui/Forms/SellerForms/EditForm';
import { EthereumGateway } from '../gateway/ethereum';
import { CreateForm } from '../components/ui/Forms/SellerForms/CreateForm';
import { ClaimLmrForm } from '../components/ui/Forms/SellerForms/ClaimLmrForm';
import isEmpty from 'lodash/isEmpty';

// This interface needs to have all the properties for both data and columns based on index.d.ts
interface CustomTableOptions extends ContractData, Header {}

interface MyContractsProps {
	web3Gateway?: EthereumGateway;
	userAccount: string;
	contracts: HashRentalContract[];
	setSidebarOpen: Dispatch<SetStateAction<boolean>>;
}

export const MyContracts: React.FC<MyContractsProps> = ({
	web3Gateway,
	userAccount,
	contracts,
	setSidebarOpen,
}) => {
	const [isLargeBreakpointOrGreater, setIsLargeBreakpointOrGreater] = useState<boolean>(true);
	const [isMediumBreakpointOrBelow, setIsMediumBreakpointOrBelow] = useState<boolean>(false);

	const [sellerEditModalOpen, setSellerEditModalOpen] = useState<boolean>(false);
	const [sellerEditContractId, setSellerEditContractId] = useState<string>('');

	const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);

	const [claimLmrModalOpen, setClaimLmrModalOpen] = useState<boolean>(false);
	const [claimLmrContractId, setClaimLmrContractId] = useState<string>('');

	const [showSpinner, setShowSpinner] = useState<boolean>(true);

	const mediaQueryListLarge = window.matchMedia('(min-width: 1280px)');
	const mediaQueryListMedium = window.matchMedia('(max-width:1279px)');
	setMediaQueryListOnChangeHandler(
		mediaQueryListLarge,
		isLargeBreakpointOrGreater,
		setIsLargeBreakpointOrGreater
	);
	setMediaQueryListOnChangeHandler(
		mediaQueryListMedium,
		isMediumBreakpointOrBelow,
		setIsMediumBreakpointOrBelow
	);

	useEffect(() => {
		if (!mediaQueryListLarge?.matches) {
			setIsLargeBreakpointOrGreater(false);
		} else {
			setIsLargeBreakpointOrGreater(true);
		}

		if (mediaQueryListMedium?.matches) {
			setIsMediumBreakpointOrBelow(true);
		} else {
			setIsMediumBreakpointOrBelow(false);
		}
	}, [mediaQueryListLarge?.matches, mediaQueryListMedium?.matches]);

	const getTimestamp: (timestamp: string, state: string) => string = (timestamp, state) => {
		if (timestamp === '0' || state === ContractState.Available) return '_____';
		return DateTime.fromSeconds(parseInt(timestamp)).toFormat('MM/dd/yyyy');
	};

	const getTableData: () => ContractData[] = () => {
		const sellerContracts = contracts.filter((contract) => contract.seller === userAccount);
		const updatedOrders = sellerContracts.map((contract) => {
			const updatedOrder = { ...contract } as ContractData;
			const now = new Date();
			if (!isEmpty(contract)) {
				updatedOrder.id = (
					<TableIcon
						icon={null}
						isLargeBreakpointOrGreater={isLargeBreakpointOrGreater}
						text={updatedOrder.id as string}
						hasLink
						justify='start'
					/>
				) as any;
				updatedOrder.price = String(divideByDigits(Number(updatedOrder.price)));
				updatedOrder.status = getStatusDiv(updatedOrder.state as string);
				updatedOrder.progress =
					updatedOrder.state === ContractState.Available
						? '_____'
						: getProgressDiv(
								updatedOrder.state as string,
								updatedOrder.timestamp as string,
								parseInt(updatedOrder.length as string),
								getSecondsEpoch(now)
						  );
				updatedOrder.progressPercentage = getProgressPercentage(
					updatedOrder.state as string,
					updatedOrder.timestamp as string,
					parseInt(updatedOrder.length as string),
					getSecondsEpoch(now)
				);
				updatedOrder.speed = String(Number(updatedOrder.speed) / 10 ** 12);
				updatedOrder.length = String(parseInt(updatedOrder.length as string) / 3600);
				//updatedOrder.length = updatedOrder.length as string;
				updatedOrder.timestamp = getTimestamp(
					contract.timestamp as string,
					updatedOrder.state as string
				);
				updatedOrder.editClaim = (
					<ButtonGroup
						button1={
							<EditButton
								contractId={contract.id as string}
								setContractId={setSellerEditContractId}
								editClickHandler={() => setSellerEditModalOpen(true)}
							/>
						}
						button2={
							<ClaimLmrButton
								contractId={contract.id as string}
								setContractId={setClaimLmrContractId}
								claimLmrClickHandler={() => setClaimLmrModalOpen(true)}
							/>
						}
					/>
				);
			}
			return updatedOrder as ContractData;
		});

		return updatedOrders;
	};

	// TODO: if same as <MyOrders /> pull out into util function
	const customSort: SortByFn<CustomTableOptions> = (rowA, rowB, columnId, desc) => {
		if (isEmpty(rowA.original)) return desc ? 1 : -1;
		if (isEmpty(rowB.original)) return desc ? -1 : 1;

		switch (columnId) {
			case 'status':
				return sortByNumber(rowA.values.status.key, rowB.values.status.key, SortByType.Int);
			case 'price':
				return sortByNumber(rowA.values.price, rowB.values.price, SortByType.Int);
			case 'length':
				return sortByNumber(rowA.values.length, rowB.values.length, SortByType.Float);
			case 'started':
				return sortByNumber(rowA.values.timestamp, rowB.values.timestamp, SortByType.Int);
			case 'progress':
				return sortByNumber(rowA.values.progress.key, rowB.values.progress.key, SortByType.Int);
			default:
				return 0;
		}
	};

	const sortTypes: Record<string, SortByFn<CustomTableOptions>> = {
		customSort: customSort,
	};

	const columns: Column<CustomTableOptions>[] = useMemo(() => {
		return isMediumBreakpointOrBelow
			? [
					{ Header: 'CONTRACT ADDRESS', accessor: 'id', disableSortBy: true },
					{ Header: 'STATUS', accessor: 'status', sortType: 'customSort' },
					{ Header: 'DURATION', accessor: 'length', sortType: 'customSort' },
					{ Header: 'PROGRESS', accessor: 'progress', sortType: 'customSort' },
					{ Header: 'EDIT', accessor: 'editClaim', disableSortBy: true },
			  ]
			: [
					{ Header: 'CONTRACT ADDRESS', accessor: 'id', disableSortBy: true },
					{ Header: 'STATUS', accessor: 'status', sortType: 'customSort' },
					{ Header: 'PRICE (LMR)', accessor: 'price', sortType: 'customSort' },
					{ Header: 'DURATION (HOURS)', accessor: 'length', sortType: 'customSort' },
					{ Header: 'STARTED', accessor: 'timestamp', sortType: 'customSort' },
					{ Header: 'PROGRESS', accessor: 'progress', sortType: 'customSort' },
					{ Header: 'EDIT', accessor: 'editClaim', disableSortBy: true },
			  ];
	}, [isMediumBreakpointOrBelow]);

	const data = useMemo(() => getTableData(), [contracts, isLargeBreakpointOrGreater]);
	const tableInstance = useTable<CustomTableOptions>({ columns, data, sortTypes }, useSortBy);

	// Remove spinner if no contracts after 1 minute
	useInterval(() => {
		if (showSpinner) setShowSpinner(false);
	}, 7000);

	const SellerToolbar = styled(Toolbar)`
		display: flex;
		justify-content: flex-end;
		width: 100%;
		margin-bottom: 3rem;
		margin-top: 2rem;

		.create-button {
			justify-self: flex-end;
			display: flex;
			justify-content: center;
			align-items: center;

			.add-icon {
				margin-bottom: 2px;
				font-size: 1.2rem;
				margin-right: 10px;
			}
		}
	`;

	return (
		<>
			<ModalItem
				open={claimLmrModalOpen}
				onClose={() => setClaimLmrModalOpen(false)}
				content={
					<ClaimLmrForm
						contracts={contracts}
						contractId={claimLmrContractId}
						userAccount={userAccount}
						web3Gateway={web3Gateway}
						onClose={() => setClaimLmrModalOpen(false)}
					/>
				}
			/>
			<ModalItem
				open={createModalOpen}
				onClose={() => setCreateModalOpen(false)}
				content={
					<CreateForm
						userAccount={userAccount}
						web3Gateway={web3Gateway}
						onClose={() => setCreateModalOpen(false)}
					/>
				}
			/>
			<ModalItem
				open={sellerEditModalOpen}
				onClose={() => setSellerEditModalOpen(false)}
				content={
					<SellerEditForm
						contracts={contracts}
						contractId={sellerEditContractId}
						userAccount={userAccount}
						web3Gateway={web3Gateway}
						onClose={() => setSellerEditModalOpen(false)}
					/>
				}
			/>
			<SellerToolbar>
				<PrimaryButton
					className='create-button'
					onClick={() => {
						setCreateModalOpen(true);
						setSidebarOpen(false);
					}}
				>
					<AddIcon className='add-icon' /> Create Contract
				</PrimaryButton>
			</SellerToolbar>
			{data.length > 0 ? (
				<Table id='mycontracts' tableInstance={tableInstance} columnCount={6} />
			) : (
				<>
					{showSpinner ? (
						<div className='spinner'>
							<Spinner />
						</div>
					) : (
						<div className='text-center text-2xl'>You have no contracts.</div>
					)}
				</>
			)}
		</>
	);
};
