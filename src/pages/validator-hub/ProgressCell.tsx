import type { ValidatorHistoryEntry } from "../../gateway/interfaces";
import { CircularProgress } from "../../components/CircularProgress";
import { styled } from "@mui/material/styles";
import { useSimulatedBlockchainTime } from "../../hooks/data/useSimulatedBlockchainTime";

/** Progress cell for the validator hub table. Updated every 1% of the contract length but at least every second */
export const ProgressCell = (props: { validatorHistoryEntry: ValidatorHistoryEntry }) => {
  const now = useSimulatedBlockchainTime({
    intervalSeconds: Math.max(Number(props.validatorHistoryEntry.length) / 100, 1),
  });
  const { progress, isRunning, isSuccess } = getStatus(props.validatorHistoryEntry, Number(now));

  const color = isSuccess ? "success" : isRunning ? "default" : "error";
  const text = isSuccess ? "Success" : isRunning ? `${Math.round(progress * 100)}%` : "Closed";

  return (
    <StyledProgressCell>
      <StyledProgressBar progress={progress} color={color} />
      {text}
    </StyledProgressCell>
  );
};

const StyledProgressBar = styled(CircularProgress)`
  width: 2em;
  height: 2em;
`;

const StyledProgressCell = styled("div")`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 0.5em;
`;

export function getStatus(r: ValidatorHistoryEntry, nowSeconds: number) {
  const purchaseTime = Number(r.purchaseTime);
  const endTime = Number(r.endTime);
  const length = Number(r.length);

  const expectedEndTime = purchaseTime + length;
  const isRunning = endTime > nowSeconds;
  const isClosedEarly = expectedEndTime > endTime;

  let progress = 1;
  // table column is sorted by this value
  // {-1;0} - closed early
  // {0;1} - running
  // 1 - success
  let sortValue = 1;

  if (isRunning) {
    progress = (nowSeconds - purchaseTime) / length;
    sortValue = progress;
  }

  if (isClosedEarly) {
    progress = (endTime - purchaseTime) / length;
    sortValue = progress - 1;
  }

  return {
    progress,
    isRunning,
    isClosedEarly,
    isSuccess: progress === 1,
    sortValue,
  };
}
