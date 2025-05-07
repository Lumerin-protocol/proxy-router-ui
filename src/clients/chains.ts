import { type Chain, arbitrum, arbitrumSepolia, hardhat } from "wagmi/chains";

const chains = {
  [arbitrumSepolia.id]: arbitrumSepolia,
  [arbitrum.id]: arbitrum,
  [hardhat.id]: hardhat,
} as Record<number, Chain>;

export const chain = chains[process.env.REACT_APP_CHAIN_ID];
