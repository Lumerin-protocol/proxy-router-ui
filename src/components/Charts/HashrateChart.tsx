import { type FC, useMemo, useEffect } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import styled from "@mui/material/styles/styled";
import type { TimePeriod } from "../../hooks/data/useHashRateIndexData";

const PeriodSwitch = styled("div")`
  display: flex;
  gap: 0;
  border: 1px solid rgba(171, 171, 171, 1);
  border-radius: 6px;
  overflow: hidden;
  align-self: end;
  margin-top: 1rem;
  margin-bottom: 1rem;
  margin-right: 12px;
`;

const PeriodButton = styled("button")<{ $active: boolean }>`
  padding: 0.5rem 1rem;
  background: ${(props) => (props.$active ? "#4c5a5f" : "transparent")};
  color: #fff;
  border: none;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  white-space: nowrap;

  &:hover {
    background: ${(props) => (props.$active ? "#4c5a5f" : "rgba(76, 90, 95, 0.5)")};
  }

  &:not(:last-child) {
    border-right: 1px solid rgba(171, 171, 171, 0.5);
  }
`;

interface HashrateChartProps {
  data: Array<{
    updatedAtDate?: Date;
    updatedAt?: string;
    priceToken: bigint;
  }>;
  isLoading?: boolean;
  marketPrice?: bigint | null;
  marketPriceFetchedAt?: Date;
  timePeriod: TimePeriod;
  onTimePeriodChange: (period: TimePeriod) => void;
}

export const HashrateChart: FC<HashrateChartProps> = ({
  data,
  isLoading = false,
  marketPrice,
  marketPriceFetchedAt,
  timePeriod,
  onTimePeriodChange,
}) => {
  // Track time period changes and log to console
  useEffect(() => {
    console.log("Time period changed to:", timePeriod);
  }, [timePeriod]);

  // Merge market price with historical data if it differs from the first item
  const enhancedData = useMemo(() => {
    if (!marketPrice || !data || data.length === 0) {
      return data;
    }

    const firstItem = data[0];
    const firstItemPrice = firstItem?.priceToken;

    if (!firstItemPrice) {
      return data;
    }

    // Check if marketPrice is different from the first item's price
    if (firstItemPrice !== marketPrice) {
      // Add marketPrice as the latest value with the timestamp when it was fetched
      return [
        {
          updatedAtDate: marketPriceFetchedAt ?? new Date(),
          priceToken: marketPrice,
        },
        ...data,
      ];
    }

    return data;
  }, [data, marketPrice, marketPriceFetchedAt]);

  // Transform data for Highcharts
  const chartData = enhancedData
    .filter((item) => item.updatedAtDate || item.updatedAt) // Filter out items without date
    .filter((item) => item.priceToken > 10000n)
    .map((item) => {
      const date = item.updatedAtDate || new Date(Number(item.updatedAt) * 1000);
      return [
        date.getTime(), // X-axis: timestamp
        Number(Number(item.priceToken) / 10 ** 6), // Y-axis: priceToken divided by 10^6
      ];
    });

  const options: Highcharts.Options = {
    chart: {
      type: "spline",
      backgroundColor: "transparent",
      style: {
        fontFamily: "inherit",
      },
    },
    title: { text: undefined },
    // title: {
    //   text: "Hashprice Index",
    //   style: {
    //     color: "#ffffff",
    //     fontWeight: "600",
    //     fontSize: "1.3em",
    //   },
    // },
    xAxis: {
      type: "datetime",
      title: {
        text: null,
        style: {
          color: "#ffffff",
        },
      },
      labels: {
        style: {
          color: "#ffffff",
        },
      },
      gridLineColor: "#333333",
    },
    yAxis: {
      title: {
        text: "USDC",
        style: {
          color: "#ffffff",
        },
      },
      // min: 100,   // Minimum value on Y-axis
      // max: 150,
      labels: {
        style: {
          color: "#ffffff",
        },
        formatter: function () {
          return Number(this.value).toFixed(2);
        },
      },
      gridLineColor: "#333333",
    },
    series: [
      {
        connectNulls: false,
        dataSorting: { enabled: false },
        dataGrouping: { enabled: false },
        type: "line",
        name: "Price Token",
        showInLegend: false,
        data: chartData,
        color: "#22c55e", // "#509EBA",
        lineWidth: 2,
        marker: {
          enabled: false,
          radius: 4,
        },
      },
    ],
    legend: {
      itemStyle: {
        color: "#ffffff",
      },
    },
    plotOptions: {
      line: {
        marker: {
          enabled: true,
        },
      },
    },
    tooltip: {
      backgroundColor: "#1a1a1a",
      borderColor: "#333333",
      style: {
        color: "#ffffff",
      },
      formatter: function () {
        // const date = new Date(this.x as number).toLocaleDateString();
        const date = new Date(this.x as number).toLocaleString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
        const value = (this.y as number).toFixed(2);

        const style = "color: grey; font-size: 10px;";
        return `<b>Price (100 TH/s per day):</b> ${value}<br/> <span style="${style}">${date}</span>`;
      },
    },
    credits: {
      enabled: false,
    },
  };

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "400px",
          color: "#ffffff",
          fontSize: "18px",
        }}
      >
        Loading chart data...
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "400px",
          color: "#ffffff",
          fontSize: "18px",
        }}
      >
        No data available
      </div>
    );
  }

  return (
    <>
      <h3>Hashprice Index</h3>
      <PeriodSwitch>
        <PeriodButton $active={timePeriod === "day"} onClick={() => onTimePeriodChange("day")}>
          1D
        </PeriodButton>
        <PeriodButton $active={timePeriod === "week"} onClick={() => onTimePeriodChange("week")}>
          7D
        </PeriodButton>
        <PeriodButton $active={timePeriod === "month"} onClick={() => onTimePeriodChange("month")}>
          1M
        </PeriodButton>
      </PeriodSwitch>
      <div style={{ width: "100%", height: "450px", paddingTop: "1rem" }}>
        <HighchartsReact highcharts={Highcharts} options={options} containerProps={{ style: { height: "100%" } }} />
      </div>
    </>
  );
};
