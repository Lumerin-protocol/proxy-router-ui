import styled from "@mui/material/styles/styled";
import EastIcon from "@mui/icons-material/East";
import { SmallWidget } from "../../Cards/Cards.styled";
import { Spinner } from "../../Spinner.styled";
import { useFuturesContractSpecs } from "../../../hooks/data/useFuturesContractSpecs";
import { formatHashrateTHPS } from "../../../lib/units";

export const FuturesMarketWidget = () => {
  const { data: contractSpecs, isLoading, error } = useFuturesContractSpecs();

  const formatSpeed = (speedHps: bigint) => {
    return formatHashrateTHPS(speedHps).full;
  };

  const formatDuration = (seconds: number) => {
    const months = Math.round(seconds / (30 * 24 * 60 * 60)); // Approximate months
    return `${months} month${months !== 1 ? "s" : ""}`;
  };

  const formatPercentage = (percent: number) => {
    return `${percent}%`;
  };

  return (
    <SmallWidget>
      <h3>Futures Market</h3>
      <MarketStats>
        {isLoading && <Spinner fontSize="0.3em" />}
        {error && <div>Error loading market data</div>}
        {contractSpecs?.data && (
          <>
            <div className="stat">
              <h4>{formatSpeed(contractSpecs.data.speedHps)}</h4>
              <p>CONTRACT SPEED</p>
            </div>
            <div className="stat">
              <h4>{formatDuration(contractSpecs.data.deliveryDurationSeconds)}</h4>
              <p>DELIVERY DURATION</p>
            </div>
            <div className="stat">
              <h4>{formatPercentage(contractSpecs.data.buyerLiquidationMarginPercent)}</h4>
              <p>BUYER MARGIN</p>
            </div>
            <div className="stat">
              <h4>{formatPercentage(contractSpecs.data.sellerLiquidationMarginPercent)}</h4>
              <p>SELLER MARGIN</p>
            </div>
          </>
        )}
      </MarketStats>
      <div className="link">
        <a href="#" onClick={(e) => e.preventDefault()}>
          Explore futures markets <EastIcon style={{ fontSize: "0.75rem" }} />
        </a>
      </div>
    </SmallWidget>
  );
};

const MarketStats = styled("div")`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 0.75rem;
  gap: 1.5rem;

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
      color: #fff;
    }
    p {
      font-size: 0.625rem;
      text-align: center;
      color: #a7a9b6;
    }
  }
`;
