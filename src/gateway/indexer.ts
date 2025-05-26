import type { GetResponse, IndexerContractEntry, ValidatorHistoryEntry } from "./interfaces";

// Get contracts from indexer. Set walletAddr to exclude contracts  you are selling (you cannot buy your own contracts)
export async function getContractsV2(walletAddr?: string): Promise<GetResponse<IndexerContractEntry[]>> {
  try {
    const url = new URL("/api/contracts", process.env.REACT_APP_INDEXER_URL);
    if (walletAddr) {
      url.searchParams.append("walletAddr", walletAddr);
    }
    const data = await fetch(url);
    const json = (await data.json()) as GetResponse<IndexerContractEntry[]>;
    return json;
  } catch (e) {
    const err = new Error(`Error calling contract indexer: ${(e as Error)?.message}`, {
      cause: e,
    });
    console.error(err);
    throw err;
  }
}

export async function getValidatorHistory(validatorAddr: string): Promise<GetResponse<ValidatorHistoryEntry[]>> {
  const url = new URL(`/api/validator/${validatorAddr}`, process.env.REACT_APP_INDEXER_URL);
  const data = await fetch(url);
  const json = (await data.json()) as GetResponse<ValidatorHistoryEntry[]>;
  return json;
}
