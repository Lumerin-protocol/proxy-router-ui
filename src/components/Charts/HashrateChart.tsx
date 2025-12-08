import { type FC, useMemo } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

interface HashrateChartProps {
  data: Array<{
    updatedAtDate?: Date;
    updatedAt?: string;
    priceToken: bigint;
  }>;
  isLoading?: boolean;
  marketPrice?: bigint | null;
}

export const HashrateChart: FC<HashrateChartProps> = ({ data, isLoading = false, marketPrice }) => {
  // Merge market price with historical data if it differs from the first item
  const enhancedData = useMemo(() => {
    if (!marketPrice || !data || data.length === 0) {
      return data;
    }

    const firstItem = data[0];
    const firstItemPrice = firstItem?.priceToken;

    // Check if marketPrice is different from the first item's price
    if (firstItemPrice !== marketPrice) {
      // Add marketPrice as the latest value with current timestamp
      return [
        {
          updatedAtDate: new Date(), // Use current time
          priceToken: marketPrice,
        },
        ...data,
      ];
    }

    return data;
  }, [data, marketPrice]);

  // Transform data for Highcharts
  const chartData = enhancedData
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
        fontWeight: "600",
        fontSize: "1.3em",
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
      },
      gridLineColor: "#333333",
    },
    series: [
      {
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
    <div style={{ width: "100%", height: "500px", paddingTop: "1rem" }}>
      <HighchartsReact highcharts={Highcharts} options={options} containerProps={{ style: { height: "100%" } }} />
    </div>
  );
};
