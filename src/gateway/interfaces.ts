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
	encrValidatorUrl: string;
	isDeleted: boolean;
	balance: string;
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
}

interface FutureTerms {
	price: string;
	limit: string;
	speed: string;
	length: string;
	version: string;
	profitTarget: string;
}
