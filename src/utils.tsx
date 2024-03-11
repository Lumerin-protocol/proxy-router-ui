import { ProgressBar } from './components/ui/ProgressBar';
import {
	AddressLength,
	AlertMessage,
	ContentState,
	ContractState,
	FormData,
	HashRentalContract,
	PathName,
	SortByType,
	SortTypes,
	StatusText,
} from './types';
import React, { Dispatch, SetStateAction } from 'react';
import { encrypt } from 'ecies-geth';
import * as URI from 'uri-js';
import { DisabledButton, PrimaryButton } from './components/ui/Forms/FormButtons/Buttons.styled';
import { bytesToHex, hexToBytes, pubToAddress } from '@ethereumjs/util';
import capitalize from 'lodash/capitalize';

// Get address based on desired length
export const truncateAddress: (address: string, desiredLength?: AddressLength) => string = (
	address,
	desiredLength
) => {
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
	return `${address.substring(0, index)}...${address.substring(
		address.length - index,
		address.length
	)}`;
};

// Convert buyer input into RFC2396 URL format
export const toRfc2396: (
	address: string,
	username: string,
	password: string
) => string | undefined = (address, username, password) => {
	const protocol = 'stratum+tcp';

	const encodedUsername = encodeURIComponent(username);
	return `${protocol}://${encodedUsername}:${password}@${address}`;
};

export const getPoolRfc2396: (formData: FormData) => string | undefined = (formData) => {
	return toRfc2396(formData.poolAddress!, formData.username!, formData.password!);
};

export const getValidatorRfc2396: (formData: FormData) => string | undefined = (formData) => {
	return toRfc2396(formData.validatorAddress!, formData.username!, formData.password!);
};

//encrypts a string passed into it
export const encryptMessage = async (pubKey: string, msg: string) => {
	const ciphertext = await encrypt(Buffer.from(pubKey, 'hex'), Buffer.from(msg));
	return ciphertext;
};

export const getValidatorPublicKey = () => {
	return process.env.REACT_APP_VALIDATOR_PUBLIC_KEY;
};

export const getTitanLightningPoolUrl = () => {
	return process.env.REACT_APP_TITAN_LIGHTNING_POOL || 'pplp.titan.io:4141';
};

export const getValidatorURL = () => {
	const url = process.env.REACT_APP_VALIDATOR_URL || '';
	return url.replace(/(^(\w|\+)+:|^)\/\//, ''); // removes protocol from url if present
};

export const isValidPoolAddress = (address: string): boolean => {
	const regexP = /^[a-zA-Z0-9.-]+:\d+$/;
	if (!regexP.test(address)) return false;

	const regexPortNumber = /:\d+/;
	const portMatch = address.match(regexPortNumber);
	if (!portMatch) return false;

	const port = portMatch[0].replace(':', '');
	if (Number(port) < 0 || Number(port) > 65536) return false;

	return true;
};

// Parse connectionString as URI to get worker and host name

export const getUsernameWithPassword = (connectionString: string): string | undefined =>
	URI.parse(connectionString!).userinfo?.replace(/:$/, '');

export const getWorkerName = (connectionString: string): string | undefined => {
	const usernameWithPassword = getUsernameWithPassword(connectionString);
	// Strip password and return username and workername only
	return usernameWithPassword && usernameWithPassword.indexOf(':') > -1
		? usernameWithPassword?.substring(0, usernameWithPassword.indexOf(':'))
		: usernameWithPassword;
};

export const getPassword = (connectionString: string): string | undefined => {
	const usernameWithPassword = getUsernameWithPassword(connectionString);
	return usernameWithPassword!.includes(':')
		? usernameWithPassword?.substring(
				usernameWithPassword.indexOf(':') + 1,
				usernameWithPassword.length
		  )
		: '';
};

export const getHostName = (connectionString: string): string | undefined =>
	URI.parse(connectionString).host;

export const getPortString = (connectionString: string): string | undefined =>
	URI.parse(connectionString).port?.toString();

export const getSchemeName = (connectionString: string): string | undefined =>
	URI.parse(connectionString).scheme;

// Make sure username contains no spaces
export const isValidUsername: (username: string) => boolean = (username) =>
	/^[a-zA-Z0-9.@-]+$/.test(username);

const EMAIL_REGEX =
	/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

// Make sure username contains no spaces
export const isValidLightningUsername: (username: string) => boolean = (username) => {
	return EMAIL_REGEX.test(username);
};

// Make sure port number is a number between 1 and 65535
export const isValidPortNumber: (portNumber: string) => boolean = (portNumber) =>
	Number(portNumber) > 0 && Number(portNumber) < 65536;

// Convert string to URI
export const stringToURI = (connectionString: string) => URI.parse(connectionString);

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

export const isNoClaim: (userAccount: string, sellerAccount: string) => boolean = (
	userAccount,
	sellerAccount
) => {
	return userAccount !== sellerAccount;
};

export const isNoEditBuyer: (contract: HashRentalContract, userAccount: string) => boolean = (
	contract,
	userAccount
) => {
	return contract.buyer === userAccount && contract.state !== ContractState.Running;
};

export const isNoEditSeller: (contract: HashRentalContract, userAccount: string) => boolean = (
	contract,
	userAccount
) => {
	return contract.seller === userAccount && contract.state === ContractState.Running;
};

export const isNoCancel: (contract: HashRentalContract, userAccount: string) => boolean = (
	contract,
	userAccount
) => {
	return userAccount !== contract.buyer || contract.state !== ContractState.Running;
};

export const sortByNumber: (rowA: string, rowB: string, sortByType: SortByType) => number = (
	rowA,
	rowB,
	sortByType
) => {
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

interface SortContractData {
	id: string;
	price?: number | string;
	length?: number | string;
	speed?: number | string;
}

export const sortContractsV2 = <T extends SortContractData>(
	sortType: SortTypes,
	contractData: T[]
) => {
	switch (sortType) {
		case SortTypes.PriceLowToHigh:
			return sortContractsList(contractData, (k) => Number(k.price), 'asc');
		case SortTypes.PriceHighToLow:
			return sortContractsList(contractData, (k) => Number(k.price), 'desc');
		case SortTypes.DurationShortToLong:
			return sortContractsList(contractData, (k) => Number(k.length), 'asc');
		case SortTypes.DurationLongToShort:
			return sortContractsList(contractData, (k) => Number(k.length), 'desc');
		case SortTypes.SpeedSlowToFast:
			return sortContractsList(contractData, (k) => Number(k.speed), 'asc');
		case SortTypes.SpeedFastToSlow:
			return sortContractsList(contractData, (k) => Number(k.speed), 'desc');
		default:
			return [...contractData];
	}
};

export const getButton: (
	contentState: string,
	buttonContent: string,
	onComplete: () => void,
	onSubmit: () => void,
	isDisabled: boolean
) => JSX.Element = (contentState, buttonContent, onComplete, onSubmit, isDisabled) => {
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
		<PrimaryButton onClick={onComplete}>
			<span>{`View ${viewText}`}</span>
		</PrimaryButton>
	) : isDisabled ? (
		<DisabledButton type='button'>{buttonContent}</DisabledButton>
	) : (
		<PrimaryButton type='button' onClick={onSubmit}>
			{buttonContent}
		</PrimaryButton>
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

// Get contract duration in days, hours, and minutes
export const getReadableDate: (length: string) => string = (length) => {
	const numLength = parseFloat(length);
	const days = Math.floor(numLength / 24);
	const remainder = numLength % 24;
	const hours = days >= 1 ? Math.floor(remainder) : Math.floor(numLength);
	const minutes =
		days >= 1
			? Math.floor(60 * (remainder - hours))
			: Math.floor((numLength - Math.floor(numLength)) * 60);
	const readableDays = days ? (days === 1 ? `${days} day` : `${days} days`) : '';
	const readableHours = hours ? (hours === 1 ? `${hours} hour` : `${hours} hours`) : '';
	const readableMinutes = minutes
		? minutes === 1
			? `${minutes} minute`
			: `${minutes} minutes`
		: '';
	const readableDate = `${readableDays} ${readableHours} ${readableMinutes}`;
	return readableDate;
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
export const getAddressDisplay: (isLargeBreakpointOrGreater: boolean, address: string) => string = (
	isLargeBreakpointOrGreater,
	address
) => {
	return isLargeBreakpointOrGreater
		? truncateAddress(address)
		: truncateAddress(address, AddressLength.SHORT);
};

// Get progress div
export const getProgressDiv: (
	state: string,
	startTime: string,
	length: number,
	currentBlockTimestamp: number
) => JSX.Element = (state, startTime, length, currentBlockTimestamp) => {
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
		<div
			key={percentage.toFixed()}
			className='flex flex-col mt-3 sm:mt-0 sm:items-center sm:flex-row'
		>
			<div>{percentage.toFixed()}%</div>
			<div className='w-1/2 sm:ml-4'>
				<ProgressBar width={percentage.toString()} />
			</div>
		</div>
	);
};

export const getProgressPercentage: (
	state: string,
	startTime: string,
	length: number,
	currentBlockTimestamp: number
) => number = (state, startTime, length, currentBlockTimestamp) => {
	let timeElapsed: number = 0;
	let percentage: number = 0;
	if (length === 0 || currentBlockTimestamp === 0 || state === ContractState.Available) {
		return 0;
	} else {
		timeElapsed = (currentBlockTimestamp as number) - parseInt(startTime);
		percentage = (timeElapsed / length) * 100;
		percentage = percentage > 100 ? 100 : percentage;
		percentage = percentage < 0 ? 0 : percentage;
	}
	return percentage;
};

// Get status div
const getStatusClass: (state: string) => string = (state) => {
	if (state === ContractState.Available) return 'bg-lumerin-aqua text-white';
	if (state === ContractState.Running) return 'bg-green-100 text-lumerin-green';
	return 'bg-lumerin-dark-gray text-black';
};

export const getStatusDiv: (state: string) => JSX.Element = (state) => {
	return (
		<div
			key={state}
			className={classNames(
				getStatusClass(state),
				'flex justify-center items-center px-4 py-0.5 rounded-15 text-xs'
			)}
		>
			<p>{capitalize(getStatusText(state))}</p>
		</div>
	);
};

// ERROR LOGGING
// Print error message and stacktrace
export const printError: (message: string, stacktrace: string) => void = (message, stacktrace) => {
	console.log(`Error: ${message}, Stacktrace: ${stacktrace}`);
};

export const getHandlerBlockchainError =
	(
		setAlertMessage: (msg: string) => void,
		setAlertOpen: (a: boolean) => void,
		setContentState: (st: ContentState) => void
	) =>
	(error: ErrorWithCode) => {
		// If user rejects transaction
		if (error.code === 4001) {
			setAlertMessage(error.message);
			setAlertOpen(true);
			setContentState(ContentState.Review);
			return;
		}

		if (error.message.includes('execution reverted: contract is not in an available state')) {
			setAlertMessage(`Execution reverted: ${AlertMessage.ContractIsPurchased}`);
			setAlertOpen(true);
			setContentState(ContentState.Review);
			return;
		}

		if (error.message.includes('Internal JSON-RPC error')) {
			let msg;
			try {
				/*
			When transaction is reverted, the error message is a such JSON string:
				`Internal JSON-RPC error.
				{
					"code": 3,
					"message": "execution reverted: contract is not in an available state",
					"data": "0x08c379a",
					"cause": null
				}`
		*/
				msg = JSON.parse(error.message.replace('Internal JSON-RPC error.', '')).message;
			} catch (e) {
				msg = 'Failed to send transaction. Execution reverted.';
			}
			setAlertMessage(msg);
			setAlertOpen(true);
			setContentState(ContentState.Review);
			return;
		}

		setAlertMessage(error.message);
		setAlertOpen(true);
		setContentState(ContentState.Review);
	};

export interface ErrorWithCode extends Error {
	code?: number;
}

export const getSecondsEpoch = (date: Date) => {
	return Math.floor(date.getTime() / 1000);
};

export const pubKeyToAddress = (pubKey: string) => {
	try {
		const bytes = hexToBytes(pubKey);
		const bytesTrimmed = bytes.slice(-64);
		const addr = pubToAddress(bytesTrimmed);
		return bytesToHex(addr);
	} catch (err) {
		console.error(err);
		throw new Error('Cannot convert pubkey to address', { cause: err });
	}
};

export const sortContractsList = <T extends { id: string }, K extends string | number>(
	data: T[],
	getter: (k: T) => number,
	direction: 'asc' | 'desc'
) => {
	return [...data].sort((a, b) => {
		let delta = numberCompareFn(getter(a), getter(b));
		if (delta === 0) {
			delta = stringCompareFn(a.id, b.id);
		}
		return direction === 'asc' ? delta : -delta;
	});
};

type StringOrNumber = string | number | bigint;

const numberCompareFn = (a: StringOrNumber, b: StringOrNumber) => Number(a) - Number(b);
const stringCompareFn = (a: StringOrNumber, b: StringOrNumber) =>
	String(a).localeCompare(String(b));
