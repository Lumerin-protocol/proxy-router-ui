import type React from "react";
import CircularProgress from "@mui/material/CircularProgress";
import { encrypt } from "ecies-geth/dist/lib/src/typescript/browser";
import { DisabledButton, PrimaryButton } from "../components/Forms/FormButtons/Buttons.styled";
import { ProgressBar } from "../components/ProgressBar";
import {
  AddressLength,
  AlertMessage,
  ContentState,
  ContractState,
  type HashRentalContract,
  PathName,
  SortTypes,
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

// HTML HELPERS
// Dynamically set classes for html elements
export const classNames: (...classes: string[]) => string = (...classes) => {
  return classes.filter(Boolean).join(" ");
};

export const sortContracts = <
  T extends {
    id: string;
    price: string;
    length: string;
    speed: string;
    timestamp?: string;
    purchaseTime?: string;
  },
>(
  sortType: SortTypes,
  contractData: T[],
): T[] => {
  switch (sortType) {
    case SortTypes.PurchaseTimeNewestToOldest:
      return sortContractsList(contractData, (k) => Number(k.timestamp || k.purchaseTime), "desc");
    case SortTypes.PurchaseTimeOldestToNewest:
      return sortContractsList(contractData, (k) => Number(k.timestamp || k.purchaseTime), "asc");
    case SortTypes.PriceLowToHigh:
      return sortContractsList(contractData, (k) => Number(k.price), "asc");
    case SortTypes.PriceHighToLow:
      return sortContractsList(contractData, (k) => Number(k.price), "desc");
    case SortTypes.DurationShortToLong:
      return sortContractsList(contractData, (k) => Number(k.length), "asc");
    case SortTypes.DurationLongToShort:
      return sortContractsList(contractData, (k) => Number(k.length), "desc");
    case SortTypes.SpeedSlowToFast:
      return sortContractsList(contractData, (k) => Number(k.speed), "asc");
    case SortTypes.SpeedFastToSlow:
      return sortContractsList(contractData, (k) => Number(k.speed), "desc");
    default:
      return contractData;
  }
};

// Display address based on breakpoint
export const getAddressDisplay: (isLargeBreakpointOrGreater: boolean, address: string) => string = (
  isLargeBreakpointOrGreater,
  address,
) => {
  return isLargeBreakpointOrGreater ? truncateAddress(address) : truncateAddress(address, AddressLength.SHORT);
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
