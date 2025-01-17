//@ts-nocheck
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
import React, { Dispatch, SetStateAction } from 'react';
import { UseFormHandleSubmit } from 'react-hook-form';
import _ from 'lodash';
import * as ethJsUtil from 'ethereumjs-util';
import { FeeMarketEIP1559Transaction } from '@ethereumjs/tx';
import { Transaction as Web3Transaction } from 'web3-eth';
import { Transaction as EthJsTx } from 'ethereumjs-tx';
import { encrypt } from 'ecies-geth';
import { ethers } from 'ethers';
import { CloneFactoryContract } from 'contracts-js';
import * as URI from 'uri-js';
import { DisabledButton, PrimaryButton } from './components/ui/Forms/FormButtons/Buttons.styled';
import { CircularProgress } from '@mui/material';

const { abi, bytecode } = CloneFactoryContract;

declare module 'web3-core' {
	interface Transaction {
		// @ts-ignore
		r: string;
		// @ts-ignore
		s: string;
		// @ts-ignore
		v: string;
		// @ts-ignore
		chainId: string;
	}
}

// STRING HELPERS
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
export const toRfc2396: (address, username, password) => string | undefined = (
	address,
	username,
	password
) => {
	const protocol = 'stratum+tcp';

	const encodedUsername = encodeURIComponent(username);
	return `${protocol}://${encodedUsername}:${password}@${address}`;
};

export const getPoolRfc2396: (formData: FormData) => string | undefined = (formData) => {
	return toRfc2396(formData.poolAddress, formData.username, formData.password);
};

export const getValidatorRfc2396: (formData: FormData) => string | undefined = (formData) => {
	return toRfc2396(formData.validatorAddress, formData.username, formData.password);
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

export const getPublicKey = async (txId: string) => {
	let provider = ethers.getDefaultProvider(process.env.REACT_APP_NODE_URL);
	let tx = await provider.getTransaction(txId)!;
	let transaction = FeeMarketEIP1559Transaction.fromTxData({
		chainId: tx.chainId,
		nonce: tx.nonce,
		maxPriorityFeePerGas: Number(tx.maxPriorityFeePerGas),
		maxFeePerGas: Number(tx.maxFeePerGas),
		gasLimit: Number(tx.gasLimit),
		to: tx.to,
		value: Number(tx.value),
		data: tx.data,
		accessList: tx.accessList,
		v: tx.v,
		r: tx.r,
		s: tx.s,
	});
	let pubKey = transaction.getSenderPublicKey();
	return `04${pubKey.toString('hex')}`; //04 is necessary to tell the EVM which public key encoding to use
};

export const getCreationTxIDOfContract = async (contractAddress: string) => {
	//import the JSON of CloneFactory.json
	let cf = new ethers.ContractFactory(abi, bytecode);
	let provider = ethers.getDefaultProvider(process.env.REACT_APP_NODE_URL as string);

	//the clonefactory contract address should become a variable that is configurable
	let cloneFactoryAddress = process.env.REACT_APP_CLONE_FACTORY as string;

	let cloneFactory = await cf.attach(cloneFactoryAddress); //this is the main ropsten clone
	cloneFactory = await cloneFactory.connect(provider);

	let contractCreated = cloneFactory.filters.contractCreated(); //used to get the event
	let events = await cloneFactory.queryFilter(contractCreated);
	let event;
	for (let i of events) {
		if (i.args!._address === contractAddress) {
			event = i;
		}
	}

	let tx = '';
	if (event) {
		tx = event.transactionHash;
	}
	return tx;
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

export const sortContracts = (
	sortType: string,
	contractData: HashRentalContract[],
	setContractData: React.Dispatch<React.SetStateAction<HashRentalContract[]>>
) => {
	switch (sortType) {
		case 'Price: Low to High':
			setContractData(sortContractsList(contractData, (k) => Number(k.price), 'asc'));
			return;
		case 'Price: High to Low':
			setContractData(sortContractsList(contractData, (k) => Number(k.price), 'desc'));
			return;
		case 'Duration: Short to Long':
			setContractData(sortContractsList(contractData, (k) => Number(k.length), 'asc'));
			return;
		case 'Duration: Long to Short':
			setContractData(sortContractsList(contractData, (k) => Number(k.length), 'desc'));
			return;
		case 'Speed: Slow to Fast':
			setContractData(sortContractsList(contractData, (k) => Number(k.speed), 'asc'));
			return;
		case 'Speed: Fast to Slow':
			setContractData(sortContractsList(contractData, (k) => Number(k.speed), 'desc'));
			return;
		default:
			setContractData([...contractData]);
			return;
	}
};

export const getButton: (
	contentState: string,
	buttonContent: string,
	onComplete: () => void,
	onSubmit,
	isDisabled,
	isSpinning?: boolean
) => JSX.Element = (
	contentState,
	buttonContent,
	onComplete,
	onSubmit,
	isDisabled,
	isSpinning = false
) => {
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

	if (isSpinning) {
		return (
			<PrimaryButton type='button'>
				<CircularProgress color='inherit' size={'16px'} />
			</PrimaryButton>
		);
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
			<p>{_.capitalize(getStatusText(state))}</p>
		</div>
	);
};

// ERROR LOGGING
// Print error message and stacktrace
export const printError: (message: string, stacktrace: string) => void = (message, stacktrace) => {
	console.log(`Error: ${message}, Stacktrace: ${stacktrace}`);
};

// Encryption helpers
// https://gist.github.com/lancecarlson/6003283
export const hexToBytes: (hex: string) => number[] = (hex) => {
	const bytes = [];
	for (let c = 0; c < hex.length; c += 2) bytes.push(parseInt(hex.substring(c, c + 2), 16));
	return bytes;
};

// https://gist.github.com/lancecarlson/6003283
export const bytesToHex: (bytes: number[]) => string = (bytes) => {
	const hex = [];
	for (let i = 0; i < bytes.length; i++) {
		let current = bytes[i] < 0 ? bytes[i] + 256 : bytes[i];
		hex.push((current >>> 4).toString(16)); // upper nibble to string
		hex.push((current & 0xf).toString(16)); // lower nibble to string
	}
	return hex.join('');
};

const getV: (v: string, chainId: number) => string = (v, chainId) => {
	switch (v) {
		case '0x0':
		case '0x1':
			return `0x${(parseInt(v, 16) + chainId * 2 + 35).toString(16)}`;
		default:
			return v;
	}
};

export const getPublicKeyFromTransaction: (transaction: Web3Transaction) => Buffer = (
	transaction
) => {
	const chainId = process.env.REACT_APP_CHAIN_ID;

	const ethTx = new EthJsTx(
		{
			nonce: transaction.nonce,
			gasPrice: ethJsUtil.bufferToHex(new ethJsUtil.BN(transaction.gasPrice) as any),
			gasLimit: transaction.gas,
			to: transaction.to as string,
			value: ethJsUtil.bufferToHex(new ethJsUtil.BN(transaction.value) as any),
			data: transaction.input,
			r: transaction.r,
			s: transaction.s,
			v: getV(transaction.v, chainId),
		},
		{
			chain: chainId,
		}
	);
	const publicKey = ethTx.getSenderPublicKey();
	return publicKey;
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

export const getHandlerBlockchainError =
	(setAlertMessage, setAlertOpen, setContentState) => (error: ErrorWithCode) => {
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

export const sortContractsList = <T extends { id: string }, K extends string | number>(
	data: T[],
	getter: (k: T) => number,
	direction: 'asc' | 'desc'
) => {
	return data.sort((a, b) => {
		let delta = numberCompareFn(getter(a), getter(b));
		if (delta === 0) {
			delta = stringCompareFn(a.id, b.id);
		}
		return direction === 'asc' ? delta : -delta;
	});
};

export const validateLightningUrl = async (email: string | undefined) => {
	if (!email) return false;

	try {
		const [username, domain] = email.split('@');
		const url = `https://${domain}/.well-known/lnurlp/${username}`;
		const res = await fetch(url);
		const data = await res.json();
		return data.callback;
	} catch (e) {
		return false;
	}
};

type StringOrNumber = string | number | bigint;

const numberCompareFn = (a: StringOrNumber, b: StringOrNumber) => Number(a) - Number(b);
const stringCompareFn = (a: StringOrNumber, b: StringOrNumber) =>
	String(a).localeCompare(String(b));
