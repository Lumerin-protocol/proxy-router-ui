import styled from "@mui/material/styles/styled";
import EastIcon from "@mui/icons-material/East";
import { SmallWidget } from "../../Cards/Cards.styled";
import { Spinner } from "../../Spinner.styled";
import { formatHashrateTHPS } from "../../../lib/units";
import { useModal } from "../../../hooks/useModal";
import { ModalItem } from "../../Modal";
import { DetailedSpecsModal } from "./DetailedSpecsModal";
import type { UseQueryResult } from "@tanstack/react-query";
import type { GetResponse } from "../../../gateway/interfaces";
import type { FuturesContractSpecs } from "../../../hooks/data/useFuturesContractSpecs";

interface FuturesMarketWidgetProps {
  contractSpecsQuery: UseQueryResult<GetResponse<FuturesContractSpecs>, Error>;
}

export const FuturesMarketWidget = ({ contractSpecsQuery }: FuturesMarketWidgetProps) => {
  const { data: contractSpecs, isLoading, error } = contractSpecsQuery;
  const detailedSpecsModal = useModal();

  const formatSpeed = (speedHps: bigint) => {
    return formatHashrateTHPS(speedHps).full;
  };

  const formatDuration = (seconds: number) => {
    const secondsInWeek = 7 * 24 * 60 * 60;
    const secondsInDay = 24 * 60 * 60;

    if (seconds < secondsInWeek) {
      const days = Math.round(seconds / secondsInDay);
      return `${days} day${days !== 1 ? "s" : ""}`;
    }

    const weeks = Math.round(seconds / secondsInWeek);
    return `${weeks} week${weeks !== 1 ? "s" : ""}`;
  };

  const formatPercentage = (percent: number) => {
    return `${percent}%`;
  };

  return (
    <>
      <SmallWidget className="lg:w-[40%]" style={{ justifyContent: "space-between" }}>
        <h3>Contract Specification</h3>
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
            View Details <EastIcon style={{ fontSize: "0.75rem" }} />
          </a>
        </div>
      </SmallWidget>

      <ModalItem open={detailedSpecsModal.isOpen} setOpen={detailedSpecsModal.setOpen}>
        <DetailedSpecsModal closeForm={detailedSpecsModal.close} contractSpecs={contractSpecs?.data} />
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
