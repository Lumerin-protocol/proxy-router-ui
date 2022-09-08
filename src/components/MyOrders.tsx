/* eslint-disable react-hooks/exhaustive-deps */
import React, {
	Dispatch,
	MouseEventHandler,
	SetStateAction,
	useEffect,
	useMemo,
	useState,
} from 'react';
import { TableIcon } from './ui/TableIcon';
import {
	getProgressDiv,
	getProgressPercentage,
	getStatusDiv,
	setMediaQueryListOnChangeHandler,
} from '../utils';
import { DateTime } from 'luxon';
import { ContractData, ContractState, HashRentalContract } from '../types';
import { Spinner } from './ui/Spinner';
import { useInterval } from './hooks/useInterval';
import { ButtonGroup } from './ui/ButtonGroup';
import { EditButton } from './ui/Forms/FormButtons/EditButton';
import { CancelButton } from './ui/Forms/FormButtons/CancelButton';
import { divideByDigits } from '../web3/helpers';
import Web3 from 'web3';
import _ from 'lodash';
import { PurchasedContracts } from './ui/Cards/PurchasedContracts';

interface MyOrdersProps {
	web3: Web3 | undefined;
	userAccount: string;
	contracts: HashRentalContract[];
	currentBlockTimestamp: number;
	setContractId: Dispatch<SetStateAction<string>>;
	editClickHandler: MouseEventHandler<HTMLButtonElement>;
	cancelClickHandler: MouseEventHandler<HTMLButtonElement>;
}

export const MyOrders: React.FC<MyOrdersProps> = ({
	web3,
	userAccount,
	contracts,
	currentBlockTimestamp,
	setContractId,
	editClickHandler,
	cancelClickHandler,
}) => {
	const [isLargeBreakpointOrGreater, setIsLargeBreakpointOrGreater] = useState<boolean>(true);
	const [isMediumBreakpointOrBelow, setIsMediumBreakpointOrBelow] = useState<boolean>(false);
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

	const getTableData: () => ContractData[] = () => {
		const buyerOrders = contracts.filter(
			(contract) => contract.buyer === userAccount && contract.state === ContractState.Running
		);
		const updatedOrders = buyerOrders.map((contract) => {
			const updatedOrder = { ...contract } as ContractData;
			if (!_.isEmpty(contract)) {
				updatedOrder.id = (
					<TableIcon
						icon={null}
						isLargeBreakpointOrGreater={isLargeBreakpointOrGreater}
						text={updatedOrder.id as string}
						hasLink
						justify='start'
					/>
				);
				updatedOrder.price = divideByDigits(updatedOrder.price as number);
				updatedOrder.status = getStatusDiv(updatedOrder.state as string);
				updatedOrder.progress = getProgressDiv(
					updatedOrder.state as string,
					updatedOrder.timestamp as string,
					parseInt(updatedOrder.length as string),
					currentBlockTimestamp
				);
				updatedOrder.progressPercentage = getProgressPercentage(
					updatedOrder.state as string,
					updatedOrder.timestamp as string,
					parseInt(updatedOrder.length as string),
					currentBlockTimestamp
				);
				updatedOrder.speed = String(Number(updatedOrder.speed) / 10 ** 12);
				updatedOrder.length = String(parseInt(updatedOrder.length as string) / 3600);
				updatedOrder.timestamp = DateTime.fromSeconds(
					parseInt(updatedOrder.timestamp as string)
				).toFormat('MM/dd/yyyy');
				updatedOrder.contractId = contract.id as string;
				updatedOrder.editCancel = (
					<ButtonGroup
						button1={
							<EditButton
								contractId={contract.id as string}
								setContractId={setContractId}
								editClickHandler={editClickHandler}
							/>
						}
						button2={
							<CancelButton
								contractId={contract.id as string}
								setContractId={setContractId}
								cancelClickHandler={cancelClickHandler}
							/>
						}
					/>
				);
			}
			return updatedOrder as ContractData;
		});

		return updatedOrders;
	};

	const data = useMemo(() => getTableData(), [contracts, isLargeBreakpointOrGreater]);

	// Remove spinner if no orders after 1 minute
	useInterval(() => {
		if (showSpinner) setShowSpinner(false);
	}, 7000);

	useEffect(() => {
		if (data.length > 1) {
			setShowSpinner(false);
		}
	});

	return (
		<div className='flex flex-col items-center'>
			{data.length > 0 ? <PurchasedContracts contracts={data} /> : null}
			{showSpinner && (
				<div className='spinner'>
					<Spinner />
				</div>
			)}
			{data.length === 1 && !showSpinner && <div className='text-2xl'>You have no orders.</div>}
		</div>
	);
};

MyOrders.displayName = 'MyOrders';
MyOrders.whyDidYouRender = false;
