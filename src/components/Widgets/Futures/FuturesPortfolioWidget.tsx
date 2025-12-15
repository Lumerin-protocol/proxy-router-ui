import styled from "@mui/material/styles/styled";
import EastIcon from "@mui/icons-material/East";
import { SmallWidget } from "../../Cards/Cards.styled";

export const FuturesPortfolioWidget = () => {
  return (
    <SmallWidget>
      <h3>Futures Portfolio</h3>
      <PortfolioStats>
        <div className="stat">
          <h4>$12,450.00</h4>
          <p>TOTAL VALUE</p>
        </div>
        <div className="stat">
          <h4>+8.5%</h4>
          <p>24H CHANGE</p>
        </div>
        <div className="stat">
          <h4>15</h4>
          <p>POSITIONS</p>
        </div>
      </PortfolioStats>
      <div className="link">
        <a href="#" onClick={(e) => e.preventDefault()}>
          View detailed portfolio <EastIcon style={{ fontSize: "0.75rem" }} />
        </a>
      </div>
    </SmallWidget>
  );
};

const PortfolioStats = styled("div")`
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
