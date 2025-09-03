import styled from "@mui/material/styles/styled";
import { useAccount, useReadContract } from "wagmi";
import { useCallback, useMemo, type FC } from "react";
import { GenericNumberStatsWidget } from "./GenericNumberStatsWidget";
import { useValidatorHistory } from "../../hooks/data/useValidatorHistory";
import { getStatus } from "../../pages/validator-hub/ProgressCell";
import { useContracts } from "../../hooks/data/useContracts";

export const ValidatorStatsWidget: FC = () => {
  const { address } = useAccount();
  const validatorHistory = useValidatorHistory({ address: address! });

  const count = useMemo(() => {
    const now = Date.now() / 1000;
    return validatorHistory.data?.reduce(
      (acc, curr) => {
        acc.total++;
        const status = getStatus(curr, now);
        if (status.isSuccess) {
          acc.success++;
        } else if (status.isRunning) {
          acc.running++;
        } else if (status.isClosedEarly) {
          acc.closed++;
        }
        return acc;
      },
      {
        total: 0,
        closed: 0,
        success: 0,
        running: 0,
      },
    );
  }, [validatorHistory.data]);

  return (
    <GenericNumberStatsWidget
      data={[
        { title: "Validating now", value: count?.running.toString() ?? "0" },
        { title: "Ran till completion", value: count?.success.toString() ?? "0" },
        { title: "Closed early", value: count?.closed.toString() ?? "0" },
      ]}
      title="Validator stats"
      contentUnderneath={<>Total validated contracts: {count?.total.toString() ?? "0"}</>}
    />
  );
};
