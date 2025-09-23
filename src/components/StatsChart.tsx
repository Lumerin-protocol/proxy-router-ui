import { type FC, useCallback } from "react";
import { css } from "@emotion/react";
import { PieChart } from "react-minimal-pie-chart";

interface StatsChartProps {
  successCount: number;
  failCount: number;
}

export const StatsChart: FC<StatsChartProps> = (props) => {
  const { successCount, failCount } = props;
  const total = successCount + failCount;

  return (
    <div
      css={css`
        width: 3em;
        height: 3em;
        position: relative;
        display: flex;
        :after {
          position: absolute;
          bottom: 100%;
          opacity: 0;
          visibility: hidden;
          width: max-content;
          transition: opacity 0.2s ease-in-out, visibility 0.2s ease-in-out;
          content: "Success: ${successCount} / Fail: ${failCount}";
          background-color: rgba(0, 0, 0, 0.5);
          color: #fff;
          font-size: 0.75rem;
          padding: 0.5rem;
          border-radius: 8px;
          transform: translateX(-25%);
        }
        :hover:after {
          opacity: 1;
          visibility: visible;
        }
      `}
    >
      <PieChart
        data={[
          {
            label: "Success",
            value: Number(successCount),
            color: "rgb(80, 158, 186)",
          },
          { label: "Fail", value: Number(failCount), color: "rgb(42, 42, 42)" },
          { label: "Total", value: total === 0 ? 1 : 0, color: "rgb(42, 42, 42)" },
        ]}
        lineWidth={30}
        rounded={false}
        startAngle={-90}
      />
      <div
        css={css`
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.7);
        `}
      >
        {total === 0 ? "n/a" : total}
      </div>
    </div>
  );
};
