import styled from "@mui/material/styles/styled";
import Skeleton from "@mui/material/Skeleton";
import EastIcon from "@mui/icons-material/East";
import { ContractState } from "../../types/types";
import { SmallWidget } from "../Cards/Cards.styled";
import { useWatchAsset } from "wagmi";
import { useFeeTokenAddress } from "../../hooks/data/useFeeTokenBalance";
import { useContracts } from "../../hooks/data/useContracts";

export const MarketplaceStatistics = () => {
  const { watchAsset } = useWatchAsset();
  const { data: feeTokenAddress } = useFeeTokenAddress();
  const contractsQuery = useContracts();

  const stats2 = {
    count: 0,
    rented: 0,
    expiresSoon: 0,
  };

  for (const contract of contractsQuery.data ?? []) {
    if (contract.isDeleted) {
      continue;
    }
    stats2.count++;

    if (contract.state === ContractState.Running) {
      stats2.rented++;

      const endTimeSeconds = Number(contract.timestamp) + Number(contract.length);
      const nowSeconds = Math.floor(Date.now() / 1000);
      const expiresInSeconds = 1 * 60 * 60; // 1 hour
      if (endTimeSeconds - nowSeconds < expiresInSeconds) {
        stats2.expiresSoon++;
      }
    }
  }

  return (
    <MarketplaceStatisticsWrapper>
      <h3>Marketplace Contracts</h3>
      <div className="stats">
        <div className="stat active">
          <h4>{contractsQuery.isLoading ? <Skeleton variant="rectangular" width={40} height={28} /> : stats2.count}</h4>
          <p>TOTAL</p>
        </div>
        <div className="stat active">
          <h4>
            {contractsQuery.isLoading ? <Skeleton variant="rectangular" width={40} height={28} /> : stats2.rented}
          </h4>
          <p>RENTED</p>
        </div>
        <div className="stat active">
          <h4>
            {contractsQuery.isLoading ? <Skeleton variant="rectangular" width={40} height={28} /> : stats2.expiresSoon}
          </h4>
          <p>EXPIRING</p>
        </div>
      </div>
      <div className="link">
        <button
          type="button"
          onClick={() =>
            watchAsset({
              type: "ERC20",
              options: {
                address: feeTokenAddress!,
                symbol: "LMR",
                decimals: 8,
                image: "https://s2.coinmarketcap.com/static/img/coins/128x128/19118.png",
              },
            })
          }
        >
          Add LMR token to your wallet <EastIcon style={{ fontSize: "0.75rem" }} />
        </button>
      </div>
    </MarketplaceStatisticsWrapper>
  );
};

const MarketplaceStatisticsWrapper = styled(SmallWidget)`
  .stats {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    padding: 0.75rem;
    gap: 1.5rem;
  }

  .active {
    color: #fff;
  }
  .completed {
    color: #a7a9b6;
  }

  .stat {
    flex: 1;
    min-width: 0;
    h4 {
      font-size: 1.85rem;
      line-height: 1.75rem;
      text-align: center;
      margin-bottom: 0.15rem;
      display: flex;
      justify-content: center;
    }
    p {
      font-size: 0.625rem;
      text-align: center;
    }
  }

  .link {
    cursor: default;

    span {
      opacity: 0;
    }
  }
`;
