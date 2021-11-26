// Exported types here
// Types local to a file will be in that file

// Enums
export enum WalletText {
	ConnectViaMetaMask = 'Connect Via MetaMask',
	Disconnect = 'Disconnect',
}

export enum ContractState {
	Available = '0',
	Active = '1',
	Running = '2',
	Complete = '3',
}

export enum ContentState {
	Create = 'CREATE',
	Review = 'REVIEW',
	Confirm = 'CONFIRM',
	Pending = 'PENDING',
	Complete = 'COMPLETE',
}

export enum AddressLength {
	SHORT,
	MEDIUM,
	LONG,
}

export enum StatusText {
	Available = 'Available',
	Active = 'Active',
	Running = 'Running',
	Complete = 'Complete',
}

export enum PathName {
	Marketplace = '/',
	MyOrders = '/myorders',
	MyContracts = '/mycontracts',
}

// Interfaces
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
}

export interface Text {
	create?: string;
	review?: string;
	confirm: string;
	completed?: string;
}
