import type React from "react";
import { CircularProgress } from "@mui/material";
import { encrypt } from "ecies-geth/dist/lib/src/typescript/browser";
import { DisabledButton, PrimaryButton } from "../components/Forms/FormButtons/Buttons.styled";
import { ProgressBar } from "../components/ProgressBar";
import {
  AddressLength,
  AlertMessage,
  ContentState,
  ContractState,
  type FormData,
  type HashRentalContract,
  PathName,
  SortByType,
  StatusText,
} from "../types/types";

// Buffer polyfill for encrypt library
import { Buffer } from "buffer/";

declare global {
  interface Window {
    Buffer: typeof Buffer;
  }
}

window.Buffer = Buffer;

export interface ErrorWithCode extends Error {
  code?: number;
}

// STRING HELPERS
// Get address based on desired length
export const truncateAddress: (address: string, desiredLength?: AddressLength) => string = (address, desiredLength) => {
  let index;
  switch (desiredLength) {
    case AddressLength.SHORT:
      index = 3;
      break;
    case AddressLength.MEDIUM:
      index = 5;
      break;
    case AddressLength.LONG:
      index = 10;
      break;
    default:
      index = 10;
  }
  return `${address.substring(0, index + 2)}...${address.substring(address.length - index, address.length)}`;
};

export const formatStratumUrl = (props: { host: string; username?: string; password?: string }) => {
  const { host, username, password } = props;
  const protocol = "stratum+tcp";
  let usernamePassword = "";
  if (username || password) {
    const encodedUsername = username && encodeURIComponent(username);
    usernamePassword = `${encodedUsername || ""}:${password || ""}@`;
  }
  return `${protocol}://${usernamePassword}${host}`;
};

// Convert buyer input into RFC2396 URL format
export const toRfc2396 = (address: string, username: string, password: string) => {
  const protocol = "stratum+tcp";

  const encodedUsername = encodeURIComponent(username);
  return `${protocol}://${encodedUsername}:${password}@${address}`;
};

//encrypts a string passed into it
export const encryptMessage = async (pubKey: string, msg: string) => {
  // Remove 0x prefix and ensure 04 prefix is present
  let key = pubKey.startsWith("0x") ? pubKey.slice(2) : pubKey;
  key = key.startsWith("04") ? key.slice(2) : key;
  const normalizedKey = `04${key}`;
  return await encrypt(Buffer.from(normalizedKey, "hex"), Buffer.from(msg));
};

export const isValidHost = (address: string): boolean => {
  const regexP = /^[a-zA-Z0-9.-]+:\d+$/;
  if (!regexP.test(address)) return false;

  const regexPortNumber = /:\d+/;
  const portMatch = address.match(regexPortNumber);
  if (!portMatch) return false;

  const port = portMatch[0].replace(":", "");
  if (Number(port) < 0 || Number(port) > 65536) return false;

  return true;
};

// Make sure username contains no spaces
export const isValidUsername: (username: string) => boolean = (username) => /^[a-zA-Z0-9.@-]+$/.test(username);

const EMAIL_REGEX =
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

// Make sure username contains no spaces
export const isValidLightningUsername: (username: string) => boolean = (username) => {
  return EMAIL_REGEX.test(username);
};

// Make sure port number is a number between 1 and 65535
export const isValidPortNumber: (portNumber: string) => boolean = (portNumber) =>
  Number(portNumber) > 0 && Number(portNumber) < 65536;

// HTML HELPERS
// Dynamically set classes for html elements
export const classNames: (...classes: string[]) => string = (...classes) => {
  return classes.filter(Boolean).join(" ");
};

// Click handler for buy/edit/cancel buttons
export const buttonClickHandler: (
  event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  open: boolean,
  setOpen: (isOpen: boolean) => void,
) => void = (event, open, setOpen) => {
  if (!open) setOpen(true);
};

// Media query change handler
export const setMediaQueryListOnChangeHandler: (
  mediaQueryList: MediaQueryList,
  isLargeBreakpointOrGreater: boolean,
  setIsLargeBreakpointOrGreater: React.Dispatch<React.SetStateAction<boolean>>,
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

export const isNoEditBuyer: (contract: HashRentalContract, userAccount: string) => boolean = (
  contract,
  userAccount,
) => {
  return contract.buyer === userAccount && contract.state !== ContractState.Running;
};

export const isNoEditSeller: (contract: HashRentalContract, userAccount: string) => boolean = (
  contract,
  userAccount,
) => {
  return contract.seller === userAccount && contract.state === ContractState.Running;
};

export const isNoCancel: (contract: HashRentalContract, userAccount: string) => boolean = (contract, userAccount) => {
  return userAccount !== contract.buyer || contract.state !== ContractState.Running;
};

export const sortByNumber: (rowA: string, rowB: string, sortByType: SortByType) => number = (
  rowA,
  rowB,
  sortByType,
) => {
  let rowASortType;
  let rowBSortType;
  switch (sortByType) {
    case SortByType.Int:
      rowASortType = Number.parseInt(rowA);
      rowBSortType = Number.parseInt(rowB);
      break;
    case SortByType.Float:
      rowASortType = Number.parseFloat(rowA);
      rowBSortType = Number.parseFloat(rowB);
  }

  if (rowASortType > rowBSortType) return -1;
  if (rowBSortType > rowASortType) return 1;
  return 0;
};

export const sortContracts = <T extends { id: string; price: string; length: string; speed: string }>(
  sortType: string,
  contractData: T[],
): T[] => {
  switch (sortType) {
    case "Price: Low to High":
      return sortContractsList(contractData, (k) => Number(k.price), "asc");
    case "Price: High to Low":
      return sortContractsList(contractData, (k) => Number(k.price), "desc");
    case "Duration: Short to Long":
      return sortContractsList(contractData, (k) => Number(k.length), "asc");
    case "Duration: Long to Short":
      return sortContractsList(contractData, (k) => Number(k.length), "desc");
    case "Speed: Slow to Fast":
      return sortContractsList(contractData, (k) => Number(k.speed), "asc");
    case "Speed: Fast to Slow":
      return sortContractsList(contractData, (k) => Number(k.speed), "desc");
    default:
      return [...contractData];
  }
};

export const getButton: (
  contentState: string,
  buttonContent: string,
  onComplete: () => void,
  onSubmit: () => void,
  isDisabled: boolean,
  isSpinning?: boolean,
) => JSX.Element = (contentState, buttonContent, onComplete, onSubmit, isDisabled, isSpinning = false) => {
  let pathName = window.location.pathname;
  let viewText = "";
  switch (pathName) {
    // Buying contract
    case PathName.Marketplace:
      pathName = PathName.BuyerHub;
      viewText = "Orders";
      break;
    // Creating contract
    case PathName.BuyerHub:
      pathName = PathName.BuyerHub;
      viewText = "Contracts";
      break;
  }

  if (isSpinning) {
    return (
      <PrimaryButton type="button">
        <CircularProgress color="inherit" size={"16px"} />
      </PrimaryButton>
    );
  }

  return contentState === ContentState.Complete ? (
    <PrimaryButton onClick={onComplete}>
      <span>{`View ${viewText}`}</span>
    </PrimaryButton>
  ) : isDisabled ? (
    <DisabledButton type="button">{buttonContent}</DisabledButton>
  ) : (
    <PrimaryButton type="button" onClick={onSubmit}>
      {buttonContent}
    </PrimaryButton>
  );
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
  address,
) => {
  return isLargeBreakpointOrGreater ? truncateAddress(address) : truncateAddress(address, AddressLength.SHORT);
};

// Get progress div
export const getProgressDiv: (
  state: string,
  startTime: string,
  length: number,
  currentBlockTimestamp: number,
) => JSX.Element = (state, startTime, length, currentBlockTimestamp) => {
  let timeElapsed = 0;
  let percentage = 0;
  if (length === 0 || currentBlockTimestamp === 0 || state === ContractState.Available) {
    return <div>0%</div>;
  }

  timeElapsed = (currentBlockTimestamp as number) - Number.parseInt(startTime);
  percentage = (timeElapsed / length) * 100;
  percentage = percentage > 100 ? 100 : percentage;
  percentage = percentage < 0 ? 0 : percentage;

  return (
    <div key={percentage.toFixed()} className="flex flex-col mt-3 sm:mt-0 sm:items-center sm:flex-row">
      <div>{percentage.toFixed()}%</div>
      <div className="w-1/2 sm:ml-4">
        <ProgressBar width={percentage.toString()} />
      </div>
    </div>
  );
};

export const getProgressPercentage: (
  state: string,
  startTime: string,
  length: number,
  currentBlockTimestamp: number,
) => number = (state, startTime, length, currentBlockTimestamp) => {
  let timeElapsed = 0;
  let percentage = 0;
  if (length === 0 || currentBlockTimestamp === 0 || state === ContractState.Available) {
    return 0;
  }
  timeElapsed = (currentBlockTimestamp as number) - Number.parseInt(startTime);
  percentage = (timeElapsed / length) * 100;
  percentage = percentage > 100 ? 100 : percentage;
  percentage = percentage < 0 ? 0 : percentage;
  return percentage;
};

// Get status div
const getStatusClass: (state: string) => string = (state) => {
  if (state === ContractState.Available) return "bg-lumerin-aqua text-white";
  if (state === ContractState.Running) return "bg-green-100 text-lumerin-green";
  return "bg-lumerin-dark-gray text-black";
};

export const getStatusDiv: (state: string) => JSX.Element = (state) => {
  return (
    <div
      key={state}
      className={classNames(getStatusClass(state), "flex justify-center items-center px-4 py-0.5 rounded-15 text-xs")}
    >
      <p className="capitalize">{getStatusText(state)}</p>
    </div>
  );
};

// ERROR LOGGING
// Print error message and stacktrace
export const printError: (message: string, stacktrace?: string) => void = (message, stacktrace) => {
  console.log(`Error: ${message}, Stacktrace: ${stacktrace}`);
};

export const getHandlerBlockchainError =
  (
    setAlertMessage: (msg: string) => void,
    setAlertOpen: (open: boolean) => void,
    setContentState: (state: ContentState) => void,
  ) =>
  (error: ErrorWithCode) => {
    // If user rejects transaction
    if (error.code === 4001) {
      setAlertMessage(error.message);
      setAlertOpen(true);
      setContentState(ContentState.Review);
      return;
    }

    if (error.message.includes("execution reverted: contract is not in an available state")) {
      setAlertMessage(`Execution reverted: ${AlertMessage.ContractIsPurchased}`);
      setAlertOpen(true);
      setContentState(ContentState.Review);
      return;
    }

    if (error.message.includes("Internal JSON-RPC error")) {
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
        msg = JSON.parse(error.message.replace("Internal JSON-RPC error.", "")).message;
      } catch (e) {
        msg = "Failed to send transaction. Execution reverted.";
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

export const sortContractsList = <T extends { id: string }>(
  data: T[],
  getter: (k: T) => number,
  direction: "asc" | "desc",
) => {
  return data.sort((a, b) => {
    let delta = numberCompareFn(getter(a), getter(b));
    if (delta === 0) {
      delta = stringCompareFn(a.id, b.id);
    }
    return direction === "asc" ? delta : -delta;
  });
};

export const validateLightningUrl = async (email: string) => {
  try {
    const [username, domain] = email.split("@");
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
const stringCompareFn = (a: StringOrNumber, b: StringOrNumber) => String(a).localeCompare(String(b));
