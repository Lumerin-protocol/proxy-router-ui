// Exported types here
// Types local to a file will be in that file

import { Dispatch, SetStateAction } from 'react';
import { HttpProvider } from 'web3-core';
import Web3 from 'web3';

// Enums
export enum WalletText {
	ConnectViaMetaMask = 'Connect Via MetaMask',
	ConnectViaWalletConnect = 'WalletConnect',
	Disconnect = 'Disconnect',
}

export enum ContractState {
	Available = '0',
	Running = '1',
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
	WrongNetworkMetaMask = 'Click to connect MetaMask to the Ropsten testnet.',
	WrongNetworkWalletConnect = 'Please connect your wallet to the Ropsten testnet.',
	InsufficientBalance = 'Insufficient LMR balance.',
	NoEditSeller = 'A running contract cannot be edited by the seller.',
	NoEditBuyer = 'An order must be running to be edited.',
	NoCancelBuyer = 'An order must be running to be cancelled.',
	InvalidPoolAddress = 'The pool address is invalid.',
	RemovePort = 'Please remove the port number from the pool address, and enter it in the Port Number field.',
	ContractIsPurchased = 'The contract has already been purchased, and its status will update shortly.',
}

export enum SortByType {
	Int,
	Float,
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

export interface HashRentalContract {
	id?: JSX.Element | string;
	price?: JSX.Element | string | number;
	speed?: string;
	length?: string;
	trade?: JSX.Element | string;
	buyer?: string;
	seller?: string;
	timestamp?: string;
	state?: string;
	encryptedPoolData?: string;
}

// Making fields optional bc a user might not have filled out the input fields
// when useForm() returns the error object that's typed against InputValues
export interface InputValuesBuyForm {
	withValidator?: boolean;
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
	editCancel?: JSX.Element;
	editClaim?: JSX.Element;
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

interface Networks {
	[networkId: number]: {
		address: string;
	};
}

export interface ContractJson {
	networks: Networks;
}
