import { ProgressBar } from './components/ui/ProgressBar';
import {
	AddressLength,
	ContentState,
	ContractState,
	FormData,
	HashRentalContract,
	InputValuesBuyForm,
	InputValuesCreateForm,
	PathName,
	SortByType,
	StatusText,
} from './types';
import { Link } from 'react-router-dom';
import { Dispatch, SetStateAction } from 'react';
import { UseFormHandleSubmit } from 'react-hook-form';
import _ from 'lodash';

// STRING HELPERS
// Get address based on desired length
export const truncateAddress: (address: string, desiredLength?: AddressLength) => string = (address, desiredLength) => {
	let index;
	switch (desiredLength) {
		case AddressLength.SHORT:
			return `${address.substring(0, 5)}...`;
		case AddressLength.MEDIUM:
			index = 5;
			break;
		case AddressLength.LONG:
			index = 10;
			break;
		default:
			index = 10;
	}
	return `${address.substring(0, index)}...${address.substring(address.length - index, address.length)}`;
};

// Convert buyer input into RFC2396 URL format
export const toRfc2396: (formData: FormData) => string | undefined = (formData) => {
	const regex = /(^.*):\/\/(.*$)/;
	const poolAddressGroups = formData.poolAddress?.match(regex) as RegExpMatchArray;
	if (!poolAddressGroups) return;
	const protocol = poolAddressGroups[1];
	const host = poolAddressGroups[2];

	return `${protocol}://${formData.username}:${formData.password}@${host}:${formData.portNumber}`;
};

export const isValidPoolAddress: (poolAddress: string, setAlertOpen: React.Dispatch<React.SetStateAction<boolean>>) => boolean = (
	poolAddress,
	setAlertOpen
) => {
	const regexPortNumber = /:\d+/;
	const hasPortNumber = (poolAddress.match(regexPortNumber) as RegExpMatchArray) !== null;
	if (hasPortNumber) setAlertOpen(true);
	const regexAddress = /(^.*):\/\/(.*$)/;
	return !hasPortNumber && (poolAddress.match(regexAddress) as RegExpMatchArray) !== null;
};

export const toInputValuesBuyForm: (encryptedPoolData: string) => InputValuesBuyForm = (encryptedPoolData) => {
	const regex = /(^.*:\/\/)(.*):(.*)@(.*):(\d+)/;
	const groups = encryptedPoolData.match(regex) as RegExpMatchArray;
	const protocol = groups[1];
	const username = groups[2];
	const password = groups[3];
	const poolAddress = `${protocol}${groups[4]}`;
	const portNumber = groups[5];

	return {
		poolAddress,
		portNumber,
		username,
		password,
	};
};

// HTML HELPERS
// Dynamically set classes for html elements
export const classNames: (...classes: string[]) => string = (...classes) => {
	return classes.filter(Boolean).join(' ');
};

// Click handler for buy/edit/cancel buttons
export const buttonClickHandler: (
	event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
	open: boolean,
	setOpen: Dispatch<SetStateAction<boolean>>
) => void = (event, open, setOpen) => {
	if (!open) setOpen(true);
};

// Media query change handler
export const setMediaQueryListOnChangeHandler: (
	mediaQueryList: MediaQueryList,
	isLargeBreakpointOrGreater: boolean,
	setIsLargeBreakpointOrGreater: React.Dispatch<React.SetStateAction<boolean>>
) => void = (mediaQueryList, isLargeBreakpointOrGreater, setIsLargeBreakpointOrGreater) => {
	function mediaQueryListOnChangeHandler(this: MediaQueryList, event: MediaQueryListEvent): void {
		if (this.matches && !isLargeBreakpointOrGreater) {
			setIsLargeBreakpointOrGreater(true);
		} else if (isLargeBreakpointOrGreater) {
			setIsLargeBreakpointOrGreater(false);
		}
	}
	if (mediaQueryList) mediaQueryList.onchange = mediaQueryListOnChangeHandler;
};

export const isNoClaim: (userAccount: string, sellerAccount: string) => boolean = (userAccount, sellerAccount) => {
	return userAccount !== sellerAccount;
};

export const isNoEditBuyer: (contract: HashRentalContract, userAccount: string) => boolean = (contract, userAccount) => {
	return contract.buyer === userAccount && contract.state !== ContractState.Running;
};

export const isNoEditSeller: (contract: HashRentalContract, userAccount: string) => boolean = (contract, userAccount) => {
	return contract.seller === userAccount && contract.state === ContractState.Running;
};

export const isNoCancel: (contract: HashRentalContract, userAccount: string) => boolean = (contract, userAccount) => {
	return userAccount !== contract.buyer || contract.state !== ContractState.Running;
};

export const sortByNumber: (rowA: string, rowB: string, sortByType: SortByType) => number = (rowA, rowB, sortByType) => {
	let rowASortType;
	let rowBSortType;
	switch (sortByType) {
		case SortByType.Int:
			rowASortType = parseInt(rowA);
			rowBSortType = parseInt(rowB);
			break;
		case SortByType.Float:
			rowASortType = parseFloat(rowA);
			rowBSortType = parseFloat(rowB);
	}

	if (rowASortType > rowBSortType) return -1;
	if (rowBSortType > rowASortType) return 1;
	return 0;
};

interface InputValues extends InputValuesBuyForm, InputValuesCreateForm {}
export const getButton: (
	contentState: string,
	bgColor: string,
	buttonOpacity: string,
	buttonContent: string,
	setOpen: Dispatch<SetStateAction<boolean>>,
	handleSubmit: UseFormHandleSubmit<InputValues>,
	createTransactionAsync: (data: InputValues) => void
) => JSX.Element = (contentState, bgColor, buttonOpacity, buttonContent, setOpen, handleSubmit, createTransactionAsync) => {
	let pathName = window.location.pathname;
	let viewText = '';
	switch (pathName) {
		// Buying contract
		case PathName.Marketplace:
			pathName = PathName.MyOrders;
			viewText = 'Orders';
			break;
		// Creating contract
		case PathName.MyContracts:
			pathName = PathName.MyContracts;
			viewText = 'Contracts';
			break;
	}

	return contentState === ContentState.Complete ? (
		<Link
			to={pathName}
			className={classNames(
				contentState === ContentState.Complete
					? 'h-16 w-full flex justify-center items-center py-2 px-4 mb-4 btn-modal text-sm font-medium text-white bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lumerin-aqua'
					: 'hidden'
			)}
			onClick={() => setOpen(false)}
		>
			<span>{`View ${viewText}`}</span>
		</Link>
	) : (
		<button
			type='submit'
			className={`h-16 w-full py-2 px-4 btn-modal text-sm font-medium text-white ${bgColor} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lumerin-aqua`}
			style={{ opacity: buttonOpacity === '25' ? '.25' : '1' }}
			onClick={handleSubmit((data) => createTransactionAsync(data))}
		>
			{buttonContent}
		</button>
	);
};

// TABLE HELPERS
// Get contract duration in days
export const getLengthDisplay: (length: number) => string = (length) => {
	const secondsInHour = 3600;
	const secondsInDay = secondsInHour * 24;

	const days = (length / secondsInDay).toFixed(2);

	return days;
};

// Display status of contracts
export const getStatusText: (state: string) => string = (state) => {
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

// Display address based on breakpoint
export const getAddressDisplay: (isLargeBreakpointOrGreater: boolean, address: string) => string = (isLargeBreakpointOrGreater, address) => {
	return isLargeBreakpointOrGreater ? truncateAddress(address) : truncateAddress(address, AddressLength.SHORT);
};

// Get progress div
export const getProgressDiv: (state: string, startTime: string, length: number, currentBlockTimestamp: number) => JSX.Element = (
	state,
	startTime,
	length,
	currentBlockTimestamp
) => {
	if (state === ContractState.Complete) return <div>100%</div>;
	let timeElapsed: number = 0;
	let percentage: number = 0;
	if (length === 0 || currentBlockTimestamp === 0 || state === ContractState.Available) {
		return <div>0%</div>;
	} else {
		timeElapsed = (currentBlockTimestamp as number) - parseInt(startTime);
		percentage = (timeElapsed / length) * 100;
		percentage = percentage > 100 ? 100 : percentage;
		percentage = percentage < 0 ? 0 : percentage;
	}

	return (
		<div key={percentage.toFixed()} className='flex items-baseline'>
			<div>{percentage.toFixed()}%</div>
			<div className='w-1/2 ml-4'>
				<ProgressBar width={percentage.toString()} />
			</div>
		</div>
	);
};

// Get status div
const getStatusClass: (state: string) => string = (state) => {
	if (state === ContractState.Available) return 'w-24 bg-lumerin-aqua text-white';
	if (state === ContractState.Running) return 'w-24 bg-lumerin-green text-white';
	return 'w-24 bg-lumerin-dark-gray text-black';
};
export const getStatusDiv: (state: string) => JSX.Element = (state) => {
	return (
		<div key={state}>
			<span className={classNames(getStatusClass(state), 'flex justify-center items-center h-8 rounded-5')}>
				<p>{_.capitalize(getStatusText(state))}</p>
			</span>
		</div>
	);
};

// ERROR LOGGING
// Print error message and stacktrace
export const printError: (message: string, stacktrace: string) => void = (message, stacktrace) => {
	console.log(`Error: ${message}, Stacktrace: ${stacktrace}`);
};
