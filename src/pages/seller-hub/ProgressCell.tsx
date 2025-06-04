import styled from "@mui/material/styles/styled";
import { CircularProgress } from "../../components/CircularProgress";
import type { HashRentalContract } from "../../types/types";
import { useSimulatedBlockchainTime } from "../../hooks/data/useSimulatedBlockchainTime";

/** Progress cell for the seller hub table. Updated every 1% of the contract length but at least every second */
export const ProgressCell = (props: { contract: HashRentalContract }) => {
  const { contract } = props;
  const nowSeconds = useSimulatedBlockchainTime({
    intervalSeconds: Math.max(Number(props.contract.length) / 100, 1),
  });
  const value = StatusAccessor(contract, Number(nowSeconds));

  if (value === -2) {
    return <ProgressCellStyled>Archived</ProgressCellStyled>;
  }
  if (value === -1) {
    return <ProgressCellStyled>Available</ProgressCellStyled>;
  }

  return (
    <ProgressCellStyled>
      <ProgressBarStyled progress={value} color="default" />
      {(value * 100).toFixed(0)}%
    </ProgressCellStyled>
  );
};

const ProgressBarStyled = styled(CircularProgress)`
  width: 2em;
  height: 2em;
`;

const ProgressCellStyled = styled("div")`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 0.5em;
`;

/** Returns the progress of the contract within [0,1], or -1/-2 if the contract
 * is available/archived to be usable as a sorting value */
export const StatusAccessor = (r: HashRentalContract, nowSeconds: number) => {
  if (r.isDeleted) {
    return -2;
  }

  // safe way to calculate progress without overflows
  // if progress is greater than 1, the contract should have been finished, thus it is available
  const progress = (Number(nowSeconds) - Number(r.timestamp)) / Number(r.length);
  if (progress > 1) {
    return -1;
  }

  return progress;
};
