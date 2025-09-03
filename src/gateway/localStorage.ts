export const storeLastPurchaseDestination = (poolAddress: string, username: string) => {
  localStorage.setItem("lastPurchaseDestination", JSON.stringify({ poolAddress, username }));
};

export const getLastPurchaseDestination = (): { poolAddress: string; username: string } | null => {
  const lastPurchaseDestination = localStorage.getItem("lastPurchaseDestination");
  if (lastPurchaseDestination === null) {
    return null;
  }
  return JSON.parse(lastPurchaseDestination);
};

export const getPoolInfo = (query: PoolInfoQuery): PoolInfo | null => {
  const poolInfoString = localStorage.getItem(poolInfoKey(query));
  if (poolInfoString === null) {
    return null;
  }
  return deserializePoolInfo(poolInfoString);
};

export const setPoolInfo = (params: PoolInfoQuery & PoolInfo) => {
  localStorage.setItem(poolInfoKey(params), serializePoolInfo(params));
};

const poolInfoKey = (query: PoolInfoQuery): string => {
  return `${query.contractId}:${query.startedAt}`;
};

const serializePoolInfo = (params: PoolInfo): string => {
  return JSON.stringify({
    poolAddress: params.poolAddress,
    username: params.username,
    validatorAddress: params.validatorAddress,
  });
};

const deserializePoolInfo = (serialized: string): PoolInfo => {
  const poolInfoJSON = JSON.parse(serialized);
  const { poolAddress, username, validatorAddress } = poolInfoJSON;

  return {
    poolAddress: isNonEmptyString(poolAddress) ? poolAddress : "",
    username: isNonEmptyString(username) ? username : "",
    validatorAddress: isNonEmptyString(validatorAddress) ? validatorAddress : "",
  };
};

const isNonEmptyString = (value: unknown): value is string => {
  return typeof value === "string" && value.length > 0;
};

type PoolInfo = {
  poolAddress: string;
  username: string;
  validatorAddress: string; // 0x123
};

type PoolInfoQuery = {
  contractId: string;
  startedAt: bigint;
};
