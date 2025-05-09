import styled from "@emotion/styled";
import { Skeleton } from "@mui/material";
import type { HashRentalContract } from "../../types/types";
import { SmallWidget } from "../Cards/Cards.styled";
import EastIcon from "@mui/icons-material/East";
import { useWatchAsset } from "wagmi";

export const MarketplaceStatistics = (props: {
  contracts: Array<HashRentalContract>;
  isLoading: boolean;
}) => {
  const { watchAsset } = useWatchAsset();

  const activeContracts = props.contracts.filter(
    (contract: HashRentalContract) => !contract.isDeleted
  );

  const getContractEndTimestamp = (contract: any) => {
    if (+contract.timestamp === 0) {
      return 0;
    }
    return (+contract.timestamp + +contract.length) * 1000; // in ms
  };

  const stats = {
    count: activeContracts.length ?? 0,
    rented: activeContracts?.filter((x) => Number(x.state) === 1)?.length ?? 0,
    expiresInHour:
      activeContracts?.filter((c) => {
        const endDate = getContractEndTimestamp(c);
        const utcNow = new Date();
        const limit = utcNow.setHours(utcNow.getHours() + 1);
        return endDate > Date.now() && endDate < limit;
      })?.length ?? 0,
  };

  return (
    <MarketplaceStatisticsWrapper>
      <h3>Marketplace Contracts</h3>
      <div className="stats">
        <div className="stat active">
          <h4>
            {props.isLoading ? (
              <Skeleton variant="rectangular" width={40} height={28} />
            ) : (
              stats.count
            )}
          </h4>
          <p>TOTAL</p>
        </div>
        <div className="stat active">
          <h4>
            {props.isLoading ? (
              <Skeleton variant="rectangular" width={40} height={28} />
            ) : (
              stats.rented
            )}
          </h4>
          <p>RENTED</p>
        </div>
        <div className="stat active">
          <h4>
            {props.isLoading ? (
              <Skeleton variant="rectangular" width={40} height={28} />
            ) : (
              stats.expiresInHour
            )}
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
                address: process.env.REACT_APP_LUMERIN_TOKEN_ADDRESS,
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
