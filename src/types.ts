// Exported types here
// Types local to a file will be in that file

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

export interface HashRentalContract {
	id?: JSX.Element | string;
	price?: JSX.Element | string | number;
	speed?: string;
	length?: string;
	trade?: JSX.Element | string;
	buyer?: string;
	timestamp?: string;
	state?: string;
}

// Making fields optional bc a user might not have filled out the input fields
// when useForm() returns the error object that's typed against InputValues
export interface InputValuesBuyForm {
	withValidator?: boolean;
	poolAddress?: string;
	username?: string;
	password?: string;
}

export interface FormData extends InputValuesBuyForm {
	speed: string;
	price: string;
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
