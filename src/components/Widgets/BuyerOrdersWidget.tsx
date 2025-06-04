import EastIcon from "@mui/icons-material/East";
import { useNavigate } from "react-router";
import { useAccount } from "wagmi";
import { ContractState, type HashRentalContract, PathName } from "../../types/types";
import { GenericNumberStatsWidget } from "./GenericNumberStatsWidget";
import { formatHashrateTHPS, formatValue } from "../../lib/units";
import { formatUnits, isAddressEqual } from "viem";

export const BuyerOrdersWidget = (props: {
  contracts: HashRentalContract[];
  isLoading: boolean;
}) => {
  const navigate = useNavigate();
  const { address: userAccount } = useAccount();

  let runningContracts = 0;
  let completedContracts = 0;
  let runningHashrate = 0;
  let totalHashes = 0;

  for (const contract of props.contracts) {
    if (isAddressEqual(contract.buyer, userAccount) && contract.state === ContractState.Running) {
      runningContracts++;
      runningHashrate += Number(contract.speed);
    }
    for (const history of contract.history ?? []) {
      if (isAddressEqual(history.buyer, userAccount)) {
        totalHashes += Number(history.speed) * Number(history.length);
        completedContracts++;
      }
    }
  }

  return (
    <>
      <GenericNumberStatsWidget
        title="Purchased Contracts"
        data={[
          { title: "ACTIVE", value: runningContracts.toString() },
          { title: "FINISHED", value: completedContracts.toString(), dim: true },
        ]}
      />
      <GenericNumberStatsWidget
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
