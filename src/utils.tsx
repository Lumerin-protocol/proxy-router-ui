import { ProgressBar } from './components/ui/ProgressBar';
import {
	AddressLength,
	ContentState,
	ContractState,
	Ethereum,
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
import * as ethJsUtil from 'ethereumjs-util';
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
		case PathName.Marketplace:
			pathName = PathName.MyOrders;
			viewText = 'Orders';
			break;
		case PathName.MyContracts:
			pathName = PathName.MyContracts;
			viewText = 'Contracts';
			break;
	}

	return contentState === ContentState.Complete ? (
		<Link
			to={pathName}
			className={
				contentState === ContentState.Complete
					? 'h-16 w-full flex justify-center items-center py-2 px-4 mb-4 btn-modal text-sm font-medium text-white bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lumerin-aqua'
					: 'hidden'
			}
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
		case ContractState.Running:
			return StatusText.Running;
		default:
			return StatusText.Available;
	}
};

// Display address based on breakpoint
export const getAddressDisplay: (isLargeBreakpointOrGreater: boolean, address: string) => string = (isLargeBreakpointOrGreater, address) => {
	return isLargeBreakpointOrGreater ? truncateAddress(address) : truncateAddress(address, AddressLength.SHORT);
};

export const getProgressDiv: (state: string, startTime: string, length: number, currentBlockTimestamp: number) => JSX.Element = (
	state,
	startTime,
	length,
	currentBlockTimestamp
) => {
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
		<div key={percentage.toFixed()} className='flex flex-col mt-3 sm:mt-0 sm:items-center sm:flex-row'>
			<div>{percentage.toFixed()}%</div>
			<div className='w-1/2 sm:ml-4'>
				<ProgressBar width={percentage.toString()} />
			</div>
		</div>
	);
};

// Get status div
const getStatusClass: (state: string) => string = (state) => {
	if (state === ContractState.Available) return 'bg-lumerin-aqua text-white';
	if (state === ContractState.Running) return 'bg-lumerin-green text-white';
	return 'bg-lumerin-dark-gray text-black';
};
export const getStatusDiv: (state: string) => JSX.Element = (state) => {
	return (
		<div key={state}>
			<span className={classNames(getStatusClass(state), 'hidden sm:flex w-16 sm:w-24 justify-center items-center h-8 rounded-5')}>
				<p>{_.capitalize(getStatusText(state))}</p>
			</span>
			<p className={classNames(state === ContractState.Running ? 'text-lumerin-green' : 'text-lumerin-aqua', 'sm:hidden')}>
				{_.capitalize(getStatusText(state))}
			</p>
		</div>
	);
};

export const getPublicKeyAsync: (from: string) => Promise<Buffer | undefined> = async (from) => {
	const ethereum = window.ethereum as Ethereum;
	const message =
		'Sign to generate your public key which will be used by the buyer to encrypt their destination details. No sensitive data is exposed by signing.';
	try {
		const msg = `0x${Buffer.from(message, 'utf8').toString('hex')}`;
		const sign = await ethereum.request({
			method: 'personal_sign',
			params: [msg, from, 'password'],
		});
		const msgHash = ethJsUtil.hashPersonalMessage(ethJsUtil.toBuffer(msg));
		const sigParams = ethJsUtil.fromRpcSig(sign as unknown as string);
		return ethJsUtil.ecrecover(msgHash, sigParams.v, sigParams.r, sigParams.s);
	} catch (error) {
		const typedError = error as Error;
		printError(typedError.message, typedError.stack as string);
	}
};

// ERROR LOGGING
// Print error message and stacktrace
export const printError: (message: string, stacktrace: string) => void = (message, stacktrace) => {
	console.log(`Error: ${message}, Stacktrace: ${stacktrace}`);
};
