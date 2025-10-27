import { type FC } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

interface HashrateChartProps {
  data: Array<{
    updatedAtDate?: Date;
    updatedAt?: string;
    priceToken: bigint;
  }>;
  isLoading?: boolean;
}

export const HashrateChart: FC<HashrateChartProps> = ({ data, isLoading = false }) => {
  // Transform data for Highcharts
  const chartData = data
    .filter((item) => item.updatedAtDate || item.updatedAt) // Filter out items without date
    .map((item) => {
      const date = item.updatedAtDate || new Date(Number(item.updatedAt) * 1000);
      return [
        date.getTime(), // X-axis: timestamp
        Number((Number(item.priceToken) / 10 ** 6).toFixed(2)), // Y-axis: priceToken divided by 10^6
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
    title: {
      text: "Hashprice Index",
      style: {
        color: "#ffffff",
      },
    },
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
        text: "Price (100 TH/s per day)",
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
      },
      gridLineColor: "#333333",
    },
    series: [
      {
        type: "line",
        name: "Price Token",
        showInLegend: false,
        data: chartData,
        color: "#509EBA",
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
        const date = new Date(this.x as number).toLocaleDateString();
        const value = (this.y as number).toFixed(2);
        return `${date}<br/><b>Price:</b> ${value} USDC`;
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
    <div style={{ width: "100%", height: "500px" }}>
      <HighchartsReact highcharts={Highcharts} options={options} containerProps={{ style: { height: "100%" } }} />
    </div>
  );
};
