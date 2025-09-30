// Exported types here
// Types local to a file will be in that file

// Enums
export enum WalletText {
  ConnectViaMetaMask = "MetaMask",
  ConnectViaWalletConnect = "WalletConnect",
  Disconnect = "Disconnect",
}

export enum ContractState {
  Available = "0",
  Running = "1",
}

export enum CurrentTab {
  Running = "RUNNING",
  Completed = "COMPLETED",
}

export enum ContentState {
  Create = "CREATE",
  Review = "REVIEW",
  Confirm = "CONFIRM",
  Pending = "PENDING",
  Complete = "COMPLETE",
  Cancel = "CANCEL",
}

export enum AddressLength {
  SHORT = 0,
  MEDIUM = 1,
  LONG = 2,
}

export enum StatusText {
  Available = "Available",
  Running = "Running",
}

export enum PathName {
  Landing = "/",
  Marketplace = "/marketplace",
  BuyerHub = "/buyerhub",
  SellerHub = "/sellerhub",
  ValidatorHub = "/validatorhub",
  Futures = "/futures",
}

export enum AlertMessage {
  NotConnected = "Your wallet is not connected",
  WrongNetworkMetaMask = "Click to connect MetaMask to the Goerli testnet.",
  WrongNetworkWalletConnect = "Please connect your wallet to the Goerli testnet.",
  NoEditSeller = "A running contract cannot be edited by the seller.",
  NoEditBuyer = "An order must be running to be edited.",
  NoCancelBuyer = "An order must be running to be cancelled.",
  InvalidPoolAddress = "The pool address is invalid.",
  RemovePort = "Oops, looks like you included the port number with the pool address. Please remove the port number from the pool address. The port number should be inputted in the port number field.",
  ContractIsPurchased = "The contract you have attempted to purchase has already been sold. Please purchase another contract.",
  ApprovePaymentFailed = "Failed to approve payment",
  ApproveFeeFailed = "Failed to approve fee",
  PurchaseFailed = "Purchase failed",
  CancelFailed = "Failed to close contract",
  EditFailed = "Failed to edit contract",
}

export enum SortByType {
  Int = 0,
  Float = 1,
}

export enum SortTypes {
  None = "None",
  PurchaseTimeNewestToOldest = "Purchase Time: Newest",
  PurchaseTimeOldestToNewest = "Purchase Time: Oldest",
  PriceLowToHigh = "Price: Low",
  PriceHighToLow = "Price: High",
  DurationShortToLong = "Duration: Short",
  DurationLongToShort = "Duration: Long",
  SpeedSlowToFast = "Speed: Slow",
  SpeedFastToSlow = "Speed: Fast",
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
  id: string;
  goodCloseout: boolean;
  buyer: string;
  endTime: string;
  purchaseTime: string;
  price: string;
  fee: string;
  speed: string;
  length: string;
  validator: string;
}

export interface HashRentalContract {
  id: string;
  price: string;
  fee: string;
  speed: string;
  length: string;
  profitTargetPercent: string;
  buyer: string;
  seller: string;
  timestamp: string;
  state: string;
  encryptedPoolData: string;
  balance: string;
  history?: ContractHistory[];
  version: string;
  isDeleted: boolean;
  validator: string;
  feeBalance: string;
  stats: {
    successCount: string;
    failCount: string;
  };
}

// Making fields optional bc a user might not have filled out the input fields
// when useForm() returns the error object that's typed against InputValues
export interface InputValuesBuyForm {
  validatorAddress: string;
  poolAddress: string;
  username: string;
  predefinedPoolIndex: number | "";
  lightningAddress: string;
  customValidatorPublicKey: string;
  customValidatorHost: string;
}

export interface FormData extends InputValuesBuyForm {
  speed?: string;
  price?: string;
  length?: string;
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
  progressPercentage?: number;
}

export interface Text {
  create: string;
  edit: string;
  cancel: string;
  review: string;
  confirm: string;
  confirmChanges: string;
  completed: string;
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

export interface Validator {
  addr: string;
  host: string;
  pubKeyX: string;
  pubKeyYparity: boolean;
}
