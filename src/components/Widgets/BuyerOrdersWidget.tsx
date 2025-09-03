import { useAccount } from "wagmi";
import { ContractState, type HashRentalContract, PathName } from "../../types/types";
import { GenericNumberStatsWidget } from "./GenericNumberStatsWidget";
import { formatHashrateTHPS, formatValue } from "../../lib/units";
import { isAddressEqual } from "viem";

export const BuyerOrdersWidget = (props: { contracts: HashRentalContract[]; isLoading: boolean }) => {
  const { address: userAccount } = useAccount();

  let runningContracts = 0;
  let completedContracts = 0;
  let runningHashrate = 0;
  let totalHashes = 0;

  if (userAccount) {
    for (const contract of props.contracts) {
      if (isAddressEqual(contract.buyer as `0x${string}`, userAccount) && contract.state === ContractState.Running) {
        runningContracts++;
        runningHashrate += Number(contract.speed);
      }
      for (const history of contract.history ?? []) {
        if (isAddressEqual(history.buyer as `0x${string}`, userAccount)) {
          totalHashes += Number(history.speed) * Number(history.length);
          completedContracts++;
        }
      }
    }
  }

  return (
    <>
      <GenericNumberStatsWidget
        maxWidth="400px"
        title="Purchased Contracts"
        isConnected={!!userAccount}
        disconnectedMessage="Connect wallet to start buying hashrate"
        data={[
          { title: "ACTIVE", value: runningContracts.toString() },
          { title: "FINISHED", value: completedContracts.toString(), dim: true },
        ]}
      />
      <GenericNumberStatsWidget
        maxWidth="500px"
        title="Purchased Hashrate"
        data={[
          {
            title: "Current Hashrate, Th/s",
            value: formatHashrateTHPS(BigInt(runningHashrate)).valueRounded,
          },
          {
            title: "Total Purchased, Th/s * hours",
            value: formatValue(BigInt(Math.round(totalHashes / 3600)), {
              decimals: 12,
              name: "Terahashes/s*hours",
              symbol: "Th/s*h",
            }).valueRounded,
            dim: true,
          },
        ]}
      />
    </>
  );
};
