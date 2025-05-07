import { http, createConfig } from "wagmi";
import { injected, metaMask, safe, walletConnect } from "wagmi/connectors";
import { chain } from "./chains";

const projectId = "a39f1fe8306051346fc52e7535cc8966";

export const config = createConfig({
  chains: [chain],
  connectors: [injected(), walletConnect({ projectId }), metaMask(), safe()],
  transports: {
    [chain.id]: http(),
  },
});
