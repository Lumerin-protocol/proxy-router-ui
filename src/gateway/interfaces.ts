// Generic response from indexer
export type GetResponse<T> = {
  data: T;
  blockNumber: number;
};

// Represents contract entry from indexer response
export interface IndexerContractEntry {
  id: string;
  state: string;
  version: string;
  price: string;
  fee: string;
  limit: string;
  speed: string;
  length: string;
  profitTarget: string;
  startingBlockTimestamp: string;
  buyer: string;
  seller: string;
  validator: string;
  encrValidatorUrl: string;
  isDeleted: boolean;
  balance: string;
  feeBalance: string;
  hasFutureTerms: boolean;
  history: ContractHistory[];
  stats: Stats;
  futureTerms?: FutureTerms;
}

interface Stats {
  successCount: string;
  failCount: string;
}

interface ContractHistory {
  buyer: string;
  endTime: string;
  price: string;
  speed: string;
  length: string;
  purchaseTime: string;
  isGoodCloseout: boolean;
  fee: string;
  validator: string;
}

interface FutureTerms {
  speed: string;
  length: string;
  version: string;
  profitTarget: string;
}

export interface ValidatorHistoryEntry {
  contract: `0x${string}`;
  purchaseTime: string;
  endTime: string;
  price: string;
  fee: string;
  speed: string;
  length: string;
  buyer: `0x${string}`;
}
