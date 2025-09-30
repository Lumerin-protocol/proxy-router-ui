import styled from "@mui/material/styles/styled";
import EastIcon from "@mui/icons-material/East";
import { SmallWidget } from "../../Cards/Cards.styled";

export const FuturesMarketWidget = () => {
  return (
    <SmallWidget>
      <h3>Futures Market</h3>
      <MarketStats>
        <div className="stat">
          <h4>$2.4M</h4>
          <p>24H VOLUME</p>
        </div>
        <div className="stat">
          <h4>1,247</h4>
          <p>ACTIVE TRADES</p>
        </div>
        <div className="stat">
          <h4>+12.3%</h4>
          <p>MARKET TREND</p>
        </div>
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
