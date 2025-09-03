export interface PoolData {
  name: string;
  address: string;
  isLightning?: boolean;
}

export const predefinedPools: PoolData[] = [
  { name: "Luxor", address: "btc.global.luxor.tech:700" },
  { name: "Braiins", address: "stratum.braiins.com:3333" },
  { name: "Ocean", address: "mine.ocean.xyz:3334" },
  { name: "Antpool", address: "ss.antpool.com:3333" },
  {
    name: "Titan Lightning Pool",
    address: process.env.REACT_APP_TITAN_LIGHTNING_POOL,
    isLightning: true,
  },
];

export function getPredefinedPoolByAddress(
  address: string | undefined | null | "",
): { data: PoolData; index: number } | undefined {
  if (!address) {
    return undefined;
  }
  const index = predefinedPools.findIndex((p) => p.address === address);
  if (index < 0) {
    return undefined;
  }
  return { data: predefinedPools[index], index };
}

export function getPredefinedPoolByIndex(index: number | ""): PoolData | undefined {
  if (index === "") {
    return undefined;
  }
  if (index < 0) {
    return undefined;
  }
  return predefinedPools[index];
}
