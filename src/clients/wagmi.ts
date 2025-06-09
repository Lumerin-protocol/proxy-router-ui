import { createAppKit } from "@reown/appkit/react";
import { chain } from "../config/chains";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import type { AppKitNetwork } from "@reown/appkit/networks";
import { http } from "viem";
import { injected } from "wagmi";
// import { /*fallback,*/ http } from "viem";
// import { http, createConfig } from "wagmi";
// import { injected, /*safe,*/ walletConnect } from "wagmi/connectors";

const projectId = process.env.REACT_APP_WALLET_CONNECT_ID;
const chains = [chain];

// config for using wagmi + walletConnect connector
// export const config = createConfig({
//   chains: chains,
//   connectors: [injected(), walletConnect({ projectId }), metaMask(), safe()],
//   transports: {
//     [chain.id]: http(),
//   },
// });

// config for using reown appkit
const wagmiAdapter = new WagmiAdapter({
  networks: chains,
  transports: {
    [chain.id]: http(process.env.REACT_APP_READ_ONLY_ETH_NODE_URL, { retryCount: 0 }),
  },
  projectId,
  ssr: false,
});

createAppKit({
  adapters: [wagmiAdapter],
  networks: chains as [AppKitNetwork],
  projectId,

  // tokens: {
  //   [`eip155:${chain.id}` as CaipNetworkId]: {
  //     address: process.env.REACT_APP_LUMERIN_TOKEN_ADDRESS,
  //     image: "https://s2.coinmarketcap.com/static/img/coins/128x128/19118.png",
  //   },
  // },
  metadata: {
    name: "Lumerin Marketplace",
    description: "Buy, sell, and own hashpower through your Web3 wallet",
    url: process.env.REACT_APP_URL, // origin must match your domain & subdomain
    icons: ["https://avatars.githubusercontent.com/u/179229932"],
  },
  features: {
    swaps: true,
    socials: false,
    email: false,
    onramp: true,
    analytics: true, // Optional - defaults to your Cloud configuration
  },
});

export const config = wagmiAdapter.wagmiConfig;
