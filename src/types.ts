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
	Running = 'running',
	Completed = 'completed',
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
	Home = '/',
	Marketplace = '/marketplace',
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
	PurchaseFailed = 'Purchase failed',
	CancelFailed = 'Failed to close contract',
	EditFailed = 'Failed to edit contract',
	Hide = '',
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
	Default = 'Default',
}

export enum CloseOutType {
	BuyerOrValidatorCancel = 0,
	SellerClaimNoClose = 1,
	CloseNoClaimAtCompletion = 2,
	CloseAndClaimAtCompletion = 3,
	Revert = 4,
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
	id: string;
	contractId?: string;
	price: string;
	speed?: string | number;
	length?: string | number;
	trade?: JSX.Element | string;
	profitTarget?: number;
	progress?: JSX.Element | string;
	progressPercentage?: number;
	editCancel?: JSX.Element | string;
	buyer?: string;
	seller?: string;
	timestamp?: string;
	state?: string;
	encryptedPoolData?: string;
	history?: ContractHistory[];
	version: string;
	isDeleted: boolean;
	balance?: string;
	hasFutureTerms?: boolean;
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
	transactionHash: string;
}

export interface Header {
	Header?: string;
	accessor?: string;
}

export interface ContractData extends HashRentalContract {
	status?: JSX.Element | string;
	endDate?: JSX.Element | string;
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

interface Networks {
	[networkId: number]: {
		address: string;
	};
}

export interface ContractJson {
	networks: Networks;
}
