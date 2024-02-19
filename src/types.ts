// Exported types here
// Types local to a file will be in that file

import { Dispatch, SetStateAction } from 'react';
import { HttpProvider } from 'web3-core';
import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';

// Enums
export enum WalletText {
	ConnectViaMetaMask = 'MetaMask',
	ConnectViaWalletConnect = 'WalletConnect',
	Disconnect = 'Disconnect',
}

export enum ContractState {
	Available = '0',
	Running = '1',
}

export enum CurrentTab {
	Running = 'RUNNING',
	Completed = 'COMPLETED',
}

export enum ContentState {
	Create = 'CREATE',
	Review = 'REVIEW',
	Confirm = 'CONFIRM',
	Pending = 'PENDING',
	Complete = 'COMPLETE',
	Cancel = 'CANCEL',
}

export enum AddressLength {
	SHORT,
	MEDIUM,
	LONG,
}

export enum StatusText {
	Available = 'Available',
	Running = 'Running',
}

export enum PathName {
	Marketplace = '/',
	MyOrders = '/buyerhub',
	MyContracts = '/sellerhub',
}

export enum AlertMessage {
	NotConnected = 'Your wallet is not connected',
	WrongNetworkMetaMask = 'Click to connect MetaMask to the Goerli testnet.',
	WrongNetworkWalletConnect = 'Please connect your wallet to the Goerli testnet.',
	InsufficientBalance = 'Insufficient LMR balance.',
	NoEditSeller = 'A running contract cannot be edited by the seller.',
	NoEditBuyer = 'An order must be running to be edited.',
	NoCancelBuyer = 'An order must be running to be cancelled.',
	InvalidPoolAddress = 'The pool address is invalid.',
	RemovePort = 'Oops, looks like you included the port number with the pool address. Please remove the port number from the pool address. The port number should be inputted in the port number field.',
	ContractIsPurchased = 'The contract you have attempted to purchase has already been sold. Please purchase another contract.',
	IncreaseAllowanceFailed = 'Failed to approve LMR transfer',
	CancelFailed = 'Failed to close contract',
	EditFailed = 'Failed to edit contract',
}

export enum SortByType {
	Int,
	Float,
}

export enum SortTypes {
	PriceLowToHigh = 'Price: Low to High',
	PriceHighToLow = 'Price: High to Low',
	DurationShortToLong = 'Duration: Short to Long',
	DurationLongToShort = 'Duration: Long to Short',
	SpeedSlowToFast = 'Speed: Slow to Fast',
	SpeedFastToSlow = 'Speed: Fast to Slow',
}

export enum CloseOutType {
	BuyerOrValidatorCancel = 0,
	SellerClaimNoClose = 1,
	CloseNoClaimAtCompletion = 2,
	CloseAndClaimAtCompletion = 3,
	Revert = 4,
}

// Interfaces
export interface Ethereum extends HttpProvider {
	networkVersion: string;
	on: <T>(method: string, callback: (input: T) => void) => void;
	request: (options: {}) => void;
}

export interface ConnectInfo {
	chainId: string;
}

export interface ContractHistory {
	id: JSX.Element | string;
	_goodCloseout: boolean;
	_buyer: string;
	_endTime: string;
	_purchaseTime: string;
	_price: JSX.Element | string | number;
	_speed: string | number;
	_length: string | number;
}

export interface HashRentalContract {
	id?: JSX.Element | string;
	contractId?: string;
	price?: JSX.Element | string | number;
	speed?: string | number;
	length?: string | number;
	trade?: JSX.Element | string;
	progress?: JSX.Element | string;
	progressPercentage?: number;
	editCancel?: JSX.Element | string;
	buyer?: string;
	seller?: string;
	timestamp?: string;
	state?: string;
	encryptedPoolData?: string;
	version?: string;
	history?: ContractHistory[];
	// isDeleted: boolean;
}

// Making fields optional bc a user might not have filled out the input fields
// when useForm() returns the error object that's typed against InputValues
export interface InputValuesBuyForm {
	validatorAddress?: string;
	poolAddress?: string;
	portNumber?: string;
	username?: string;
	password?: string;
}

export interface FormData extends InputValuesBuyForm {
	speed?: string;
	price?: string;
	length?: string;
}

export interface InputValuesCreateForm {
	walletAddress?: string;
	contractTime?: number;
	speed?: number;
	listPrice?: number;
}

export interface Receipt {
	status: boolean;
}

export interface Header {
	Header?: string;
	accessor?: string;
}

export interface ContractData extends HashRentalContract {
	status?: JSX.Element | string;
	progress?: JSX.Element | string;
	progressPercentage?: number;
	contractId?: string;
	editCancel?: JSX.Element;
	editClaim?: JSX.Element;
}

export interface ContractHistoryData extends ContractHistory {
	status?: JSX.Element | string;
	progress?: JSX.Element | string;
	progressPercentage?: number;
	contractId?: string;
}

export interface Text {
	create?: string;
	edit?: string;
	cancel?: string;
	review?: string;
	confirm?: string;
	confirmChanges?: string;
	completed?: string;
}

export interface ContractInfo {
	speed: string;
	price: string;
}

export interface SendOptions {
	from: string;
	gas: number;
	value?: string;
}

export interface UpdateFormProps {
	contracts: HashRentalContract[];
	contractId: string;
	userAccount: string;
	web3: Web3 | undefined;
	setOpen: Dispatch<SetStateAction<boolean>>;
	currentBlockTimestamp?: number;
}

export interface CancelFormProps extends UpdateFormProps {
	cloneFactoryContract: Contract | undefined;
}

interface Networks {
	[networkId: number]: {
		address: string;
	};
}

export interface ContractJson {
	networks: Networks;
}
