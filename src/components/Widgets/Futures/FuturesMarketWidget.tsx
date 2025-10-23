import styled from "@mui/material/styles/styled";
import EastIcon from "@mui/icons-material/East";
import { SmallWidget } from "../../Cards/Cards.styled";
import { Spinner } from "../../Spinner.styled";
import { useFuturesContractSpecs } from "../../../hooks/data/useFuturesContractSpecs";
import { formatHashrateTHPS } from "../../../lib/units";
import { useModal } from "../../../hooks/useModal";
import { ModalItem } from "../../Modal";
import { DetailedSpecsModal } from "./DetailedSpecsModal";

export const FuturesMarketWidget = () => {
  const { data: contractSpecs, isLoading, error } = useFuturesContractSpecs();
  const detailedSpecsModal = useModal();

  const formatSpeed = (speedHps: bigint) => {
    return formatHashrateTHPS(speedHps).full;
  };

  const formatDuration = (seconds: number) => {
    const weeks = Math.round(seconds / (7 * 24 * 60 * 60)); // Convert to weeks
    return `${weeks} week${weeks !== 1 ? "s" : ""}`;
  };

  const formatPercentage = (percent: number) => {
    return `${percent}%`;
  };

  return (
    <>
      <SmallWidget>
        <h3>Contract Spec</h3>
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
            </>
          )}
        </MarketStats>
        <div className="link">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              detailedSpecsModal.open();
            }}
          >
            Detailed specs <EastIcon style={{ fontSize: "0.75rem" }} />
          </a>
        </div>
      </SmallWidget>

      <ModalItem open={detailedSpecsModal.isOpen} setOpen={detailedSpecsModal.setOpen}>
        <DetailedSpecsModal closeForm={detailedSpecsModal.close} />
      </ModalItem>
    </>
  );
};

const MarketStats = styled("div")`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 0.75rem;
  gap: 1.5rem;

  .stat {
    // flex: 1;
    // min-width: 0;
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
