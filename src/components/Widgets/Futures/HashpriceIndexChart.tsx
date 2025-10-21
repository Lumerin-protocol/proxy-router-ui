import styled from "@mui/material/styles/styled";
import { SmallWidget } from "../../Cards/Cards.styled";
import { useState } from "react";

interface ChartDataPoint {
  x: number;
  y: number;
  isHighlighted?: boolean;
}

export const HashpriceIndexChart = () => {
  // Dummy data based on the screenshot - scatter plot points
  const scatterData: ChartDataPoint[] = [
    { x: 0, y: 40, isHighlighted: false },
    { x: 2, y: 45, isHighlighted: false },
    { x: 4, y: 55, isHighlighted: false },
    { x: 6, y: 65, isHighlighted: false },
    { x: 8, y: 80, isHighlighted: false },
  ];

  // Dummy data for the line chart
  const lineData: ChartDataPoint[] = [
    { x: 0, y: 10 },
    { x: 1, y: 15 },
    { x: 2, y: 25 },
    { x: 3, y: 20 },
    { x: 4, y: 35 },
    { x: 5, y: 30 },
    { x: 6, y: 45 },
    { x: 7, y: 50 },
    { x: 8, y: 40 },
    { x: 9, y: 60 },
    { x: 10, y: 70, isHighlighted: true },
    { x: 11, y: 50, isHighlighted: true },
    { x: 12, y: 85, isHighlighted: true },
  ];

  const maxY = 100;
  const maxX = 12;

  const getYPosition = (y: number) => {
    return ((maxY - y) / maxY) * 100;
  };

  const getXPosition = (x: number) => {
    return (x / maxX) * 100;
  };

  return (
    <ChartWidget>
      <h3>Hashprice Index</h3>

      <ChartContainer>
        <svg width="100%" height="200" viewBox="0 0 600 200">
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Scatter plot points (left side) */}
          <g>
            {scatterData.map((point, index) => (
              <circle
                key={`scatter-${index}`}
                cx={getXPosition(point.x) * 0.5 * 6} // Scale to left half with wider viewBox
                cy={getYPosition(point.y) * 2} // Scale to chart height
                r="3"
                fill="#000"
              />
            ))}
          </g>

          {/* Line chart (right side) */}
          <g>
            <path
              d={`M ${getXPosition(0) * 0.5 * 6 + 300} ${getYPosition(lineData[0].y) * 2} ${lineData
                .slice(1)
                .map((point, index) => `L ${getXPosition(point.x) * 0.5 * 6 + 300} ${getYPosition(point.y) * 2}`)
                .join(" ")}`}
              fill="none"
              stroke="#000"
              strokeWidth="2"
            />

            {/* Highlighted points */}
            {lineData
              .filter((point) => point.isHighlighted)
              .map((point, index) => (
                <circle
                  key={`highlight-${index}`}
                  cx={getXPosition(point.x) * 0.5 * 6 + 300}
                  cy={getYPosition(point.y) * 2}
                  r="4"
                  fill="#fff"
                  stroke="#ef4444"
                  strokeWidth="2"
                />
              ))}
          </g>
        </svg>
      </ChartContainer>

      <ChartInfo>
        <div className="info-item">
          <span className="label">Current Price:</span>
          <span className="value">$4.85</span>
        </div>
        <div className="info-item">
          <span className="label">24h Change:</span>
          <span className="value positive">+2.3%</span>
        </div>
      </ChartInfo>
    </ChartWidget>
  );
};

const ChartWidget = styled(SmallWidget)`
  width: 100%;
  padding: 1rem;
`;

const ChartContainer = styled("div")`
  width: 100%;
  height: 200px;
  margin: 1rem 0;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
  overflow: hidden;
`;

const ChartInfo = styled("div")`
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  
  .info-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    
    .label {
      font-size: 0.75rem;
      color: #a7a9b6;
      margin-bottom: 0.25rem;
    }
    
    .value {
      font-size: 1rem;
      font-weight: 600;
      color: #fff;
      
      &.positive {
        color: #22c55e;
      }
      
      &.negative {
        color: #ef4444;
      }
    }
  }
`;
