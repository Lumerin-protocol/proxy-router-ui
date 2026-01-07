import styled from "@mui/material/styles/styled";
import { useMemo } from "react";
import { PrimaryButton } from "../../Forms/FormButtons/Buttons.styled";
import { formatHashrateTHPS } from "../../../lib/units";
import { useGetDeliveryDates } from "../../../hooks/data/useGetDeliveryDates";
import type { FuturesContractSpecs } from "../../../hooks/data/useFuturesContractSpecs";

interface DetailedSpecsModalProps {
  closeForm: () => void;
  contractSpecs: FuturesContractSpecs | null | undefined;
}

export const DetailedSpecsModal = ({ closeForm, contractSpecs }: DetailedSpecsModalProps) => {
  const { data: deliveryDatesRaw } = useGetDeliveryDates();

  // Get the first available delivery date (filtered and sorted)
  const firstDeliveryDate = useMemo(() => {
    if (!deliveryDatesRaw) return null;
    const now = Math.floor(Date.now() / 1000);
    const validDates = deliveryDatesRaw
      .map((date) => Number(date))
      .filter((deliveryDate) => deliveryDate >= now)
      .sort((a, b) => a - b);
    return validDates.length > 0 ? validDates[0] : null;
  }, [deliveryDatesRaw]);

  // Format time only from timestamp
  const formatExpirationTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

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

  if (!contractSpecs) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-white mb-6">Contract Specifications</h2>
        <div>Loading contract specifications...</div>
      </div>
    );
  }

  const speedFormatted = formatSpeed(contractSpecs.speedHps);
  const durationFormatted = formatDuration(contractSpecs.deliveryDurationSeconds);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-white mb-6">Contract Specifications</h2>

      <div>
        <SpecItem>
          <SpecLabel>Contract Unit</SpecLabel>
          <SpecValue>
            {speedFormatted} per {durationFormatted}
          </SpecValue>
        </SpecItem>

        <SpecItem>
          <SpecLabel>Price Quotation</SpecLabel>
          <SpecValue>U.S. dollars and cents per {speedFormatted} per day</SpecValue>
        </SpecItem>

        <SpecItem>
          <SpecLabel>Tick Size</SpecLabel>
          <SpecValue>$0.01</SpecValue>
        </SpecItem>

        <SpecItem>
          <SpecLabel>Tick Value</SpecLabel>
          <SpecValue>${contractSpecs.deliveryDurationDays * 0.01}</SpecValue>
        </SpecItem>

        <SpecItem>
          <SpecLabel>Contract Address</SpecLabel>
          <SpecValue style={{ wordBreak: "break-all", fontFamily: "monospace" }}>
            {process.env.REACT_APP_FUTURES_TOKEN_ADDRESS || "Not configured"}
          </SpecValue>
        </SpecItem>

        <SpecItem>
          <SpecLabel>Expiration Time</SpecLabel>
          <SpecValue>{firstDeliveryDate ? formatExpirationTime(firstDeliveryDate) : "No dates available"}</SpecValue>
        </SpecItem>
      </div>
    </div>
  );
};

const SpecItem = styled("div")`
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 1rem;
  
  &:last-child {
    border-bottom: none;
  }
`;

const SpecLabel = styled("h3")`
  font-size: 1.1rem;
  font-weight: 600;
  color: #fff;
  margin-bottom: 0.5rem;
`;

const SpecValue = styled("div")`
  font-size: 1rem;
  font-weight: 500;
  color: #22c55e;
  margin-bottom: 0.5rem;
`;

const SpecDescription = styled("p")`
  font-size: 0.875rem;
  color: #a7a9b6;
  line-height: 1.5;
`;
