import type { FC, HTMLProps, PropsWithChildren } from "react";
import { PieChart, PieChartProps } from "react-minimal-pie-chart";

type Props = PropsWithChildren<{
  progress: number;
  className?: string;
  color?: "default" | "error" | "success";
}>;

const colors = {
  default: "rgb(80, 158, 186)",
  error: "rgb(255, 59, 59)",
  success: "rgb(71, 158, 71)",
};

export const CircularProgress: FC<Props> = (props) => {
  const { progress, color = "default" } = props;
  const lineWidth = 27;

  if (progress < 0 || progress > 1) {
    throw new Error(`Progress must be between 0 and 1: ${progress}`);
  }

  const data = [
    { value: progress, color: colors[color] },
    { value: 1 - progress, color: "rgba(50, 50, 50)" },
  ];

  return (
    <PieChart
      {...props}
      // segmentsStyle={(index) => {
      //   return {
      //     stroke: index === 0 ? "url(#cl1)" : "rgb(80, 158, 186)",
      //   };
      // }}
      data={data}
      totalValue={1}
      lineWidth={lineWidth}
      rounded={false}
      startAngle={-90}
    />
  );
};
