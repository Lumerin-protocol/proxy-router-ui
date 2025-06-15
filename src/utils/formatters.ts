import { AddressLength } from "../types/types";

// STRING HELPERS
// Get address based on desired length

export const truncateAddress: (address: string, desiredLength?: AddressLength) => string = (address, desiredLength) => {
  let index = 0;
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
}; // Display address based on breakpoint

export const getAddressDisplay: (isLargeBreakpointOrGreater: boolean, address: string) => string = (
  isLargeBreakpointOrGreater,
  address,
) => {
  return isLargeBreakpointOrGreater ? truncateAddress(address) : truncateAddress(address, AddressLength.SHORT);
};
