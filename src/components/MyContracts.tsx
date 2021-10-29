import { useEffect, useMemo, useState } from 'react';
import { Column, useTable } from 'react-table';
import { AddressLength, ContractData, ContractState, HashRentalContract, Header, StatusText } from '../types';
import { classNames, getLengthDisplay, setMediaQueryListOnChangeHandler, truncateAddress } from '../utils';
import { ProgressBar } from './ui/ProgressBar';
import { Table } from './ui/Table';
import { TableIcon } from './ui/TableIcon';
import { DateTime } from 'luxon';
import Web3 from 'web3';
import _ from 'lodash';

// This interface needs to have all the properties for both data and columns based on index.d.ts
interface CustomTableOptions extends ContractData, Header {}

interface MyContractsProps {
	userAccount: string;
	contracts: HashRentalContract[];
	web3: Web3 | undefined;
}

export const MyContracts: React.FC<MyContractsProps> = ({ userAccount, contracts, web3 }) => {
	const [currentBlockTimestamp, setCurrentBlockTimestamp] = useState<number>(0);
	const [isLargeBreakpointOrGreater, setIsLargeBreakpointOrGreater] = useState<boolean>(true);

	// Adjust contract address length when breakpoint > lg
	const mediaQueryList = window.matchMedia('(min-width: 1200px)');
	setMediaQueryListOnChangeHandler(mediaQueryList, isLargeBreakpointOrGreater, setIsLargeBreakpointOrGreater);

	useEffect(() => {
		if (!mediaQueryList?.matches) {
			setIsLargeBreakpointOrGreater(false);
		} else {
			setIsLargeBreakpointOrGreater(true);
		}
	}, [mediaQueryList?.matches]);

	useEffect(() => {
		if (!mediaQueryList?.matches) {
			setIsLargeBreakpointOrGreater(false);
		} else {
			setIsLargeBreakpointOrGreater(true);
		}
	}, [mediaQueryList?.matches]);

	const getCurrentBlockTimestampAsync: () => void = async () => {
		const currentBlockTimestamp = (await web3?.eth.getBlock('latest'))?.timestamp;
		setCurrentBlockTimestamp(currentBlockTimestamp as number);
	};

	useEffect(() => getCurrentBlockTimestampAsync(), [web3]);

	const getStatusText: (state: string) => string = (state) => {
		switch (state) {
			case ContractState.Available:
				return StatusText.Available;
			case ContractState.Active:
				return StatusText.Active;
			case ContractState.Running:
				return StatusText.Running;
			case ContractState.Complete:
				return StatusText.Complete;
			default:
				return StatusText.Complete;
		}
	};

	const getStatusDiv: (state: string) => JSX.Element = (state) => {
		return (
			<div>
				<span
					className={classNames(
						state === ContractState.Available || state === ContractState.Running
							? 'w-20 bg-lumerin-green text-white'
							: 'w-28 bg-lumerin-dark-gray text-black',
						'flex justify-center items-center h-8 rounded-5'
					)}
				>
					<p>{_.capitalize(getStatusText(state))}</p>
				</span>
			</div>
		);
	};

	const getProgressDiv: (startTime: string, length: number) => JSX.Element = (startTime, length) => {
		let timeElapsed: number = 0;
		let percentage: number = 0;
		if (length === 0 || currentBlockTimestamp === 0) {
			percentage = 100;
		} else {
			timeElapsed = (currentBlockTimestamp as number) - parseInt(startTime);
			percentage = (timeElapsed / length) * 100;
			percentage = percentage > 100 ? 100 : percentage;
		}

		return (
			<div className='flex items-baseline'>
				<div>{percentage.toFixed()}%</div>
				<div className='w-1/2 ml-4'>
					<ProgressBar width={percentage.toString()} />
				</div>
			</div>
		);
	};

	const getTableData: () => ContractData[] = () => {
		const sellerContracts = contracts.filter((contract) => contract.seller === userAccount);
		// Add emtpy row for styling
		sellerContracts.unshift({});
		const updatedOrders = sellerContracts.map((contract) => {
			const updatedOrder = { ...contract } as ContractData;
			if (!_.isEmpty(contract)) {
				updatedOrder.id = (
					<TableIcon
						icon={null}
						text={
							isLargeBreakpointOrGreater
								? truncateAddress(updatedOrder.id as string)
								: truncateAddress(updatedOrder.id as string, AddressLength.SHORT)
						}
						hasLink
						justify='start'
					/>
				);
				updatedOrder.status = getStatusDiv(updatedOrder.state as string);
				updatedOrder.progress = getProgressDiv(updatedOrder.timestamp as string, parseInt(updatedOrder.length as string));
				updatedOrder.length = getLengthDisplay(parseInt(updatedOrder.length as string));
				updatedOrder.timestamp = DateTime.fromSeconds(parseInt(updatedOrder.timestamp as string)).toFormat('MM/dd/yyyy hh:mm:ss');
			}
			return updatedOrder as ContractData;
		});

		return updatedOrders;
	};
	const columns: Column<CustomTableOptions>[] = useMemo(
		() => [
			{ Header: 'CONTRACT ADDRESS', accessor: 'id' },
			{ Header: 'STATUS', accessor: 'status' },
			{ Header: 'List Price (LMR)', accessor: 'price' },
			{ Header: 'Duration (DAYS)', accessor: 'length' },
			{ Header: 'STARTED', accessor: 'timestamp' },
			{ Header: 'PROGRESS', accessor: 'progress' },
		],
		[]
	);

	const data = getTableData();
	const tableInstance = useTable<CustomTableOptions>({ columns, data });

	return <Table id='mycontracts' tableInstance={tableInstance} columnCount={6} isLargeBreakpointOrGreater={isLargeBreakpointOrGreater} />;
};

MyContracts.displayName = 'MyContracts';
MyContracts.whyDidYouRender = false;
