import type React from "react";
import type { PublicClient } from "viem";
import { useAccount, usePublicClient } from "wagmi";
import { Router } from "./Router";
import { EthereumGateway } from "./gateway/ethereum";

// Main contains the basic layout of pages and maintains contract state needed by its children
export const State: React.FC = () => {
  const pc = usePublicClient();

  const web3Gateway = new EthereumGateway(
    process.env.REACT_APP_CLONE_FACTORY,
    process.env.REACT_APP_INDEXER_URL,
    pc as PublicClient,
  );

  return <Router web3Gateway={web3Gateway} />;
};
