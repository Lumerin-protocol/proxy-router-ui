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
