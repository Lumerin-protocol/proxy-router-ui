import { SortTypes } from "../types/types";

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
type StringOrNumber = string | number | bigint;
const numberCompareFn = (a: StringOrNumber, b: StringOrNumber) => Number(a) - Number(b);
const stringCompareFn = (a: StringOrNumber, b: StringOrNumber) => String(a).localeCompare(String(b));
