import { sortContractsList } from "../utils/utils";
import type { IndexerContractEntry } from "./interfaces";

export async function getContractsV2(walletAddr?: string): Promise<IndexerContractEntry[]> {
  try {
    const url = new URL("/api/contracts", process.env.REACT_APP_INDEXER_URL);
    if (walletAddr) {
      url.searchParams.append("walletAddr", walletAddr);
    }
    const data = await fetch(url);
    const json = (await data.json()) as IndexerContractEntry[];
    return sortContractsList(json, (c) => Number(c.stats.successCount), "asc");
  } catch (e) {
    const err = new Error(`Error calling contract indexer: ${(e as Error)?.message}`, {
      cause: e,
    });
    console.error(err);
    throw err;
  }
}
