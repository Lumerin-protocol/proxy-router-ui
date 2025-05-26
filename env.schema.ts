import { type Static, type StringOptions, type TUnsafe, Type } from "@sinclair/typebox";

// Eth address field validator
const TypeEthAddress = (opt?: StringOptions) =>
  Type.String({ ...opt, pattern: "^0x[a-fA-F0-9]{40}$" }) as TUnsafe<`0x${string}`>;

// Environment variables schema
export const EnvSchema = Type.Object({
  REACT_APP_BUY_LMR_URL: Type.String({ format: "uri" }),
  REACT_APP_CHAIN_ID: Type.Number(),
  REACT_APP_CLONE_FACTORY: TypeEthAddress(),
  REACT_APP_ETHERSCAN_URL: Type.String({ format: "uri" }),
  REACT_APP_GITBOOK_URL: Type.String({ format: "uri" }),
  REACT_APP_INDEXER_URL: Type.String({ format: "uri" }),
  REACT_APP_MULTICALL_ADDRESS: Type.Optional(TypeEthAddress()),
  REACT_APP_READ_ONLY_ETH_NODE_URL: Type.String({ format: "uri" }),
  REACT_APP_TITAN_LIGHTNING_POOL: Type.String({ default: "pplp.titan.io:4141" }),
  REACT_APP_URL: Type.String({ format: "uri" }),
  REACT_APP_VALIDATOR_REGISTRY_ADDRESS: TypeEthAddress(),
  REACT_APP_VERSION: Type.String(),
  REACT_APP_WALLET_CONNECT_ID: Type.String({ minLength: 1 }),
});

// Inferred type of environment variables
export type Env = Static<typeof EnvSchema>;
