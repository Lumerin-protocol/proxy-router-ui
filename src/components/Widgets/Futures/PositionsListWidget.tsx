import styled from "@mui/material/styles/styled";
import { SmallWidget } from "../../Cards/Cards.styled";
import { useState } from "react";
import type { ParticipantPosition } from "../../../hooks/data/useParticipant";

interface PositionsListWidgetProps {
  positions: ParticipantPosition[];
  isLoading?: boolean;
  participantAddress?: `0x${string}`;
}

export const PositionsListWidget = ({ positions, isLoading, participantAddress }: PositionsListWidgetProps) => {
  const getStatusColor = (isActive: boolean, closedAt: string | null) => {
    if (closedAt) {
      return "#6b7280"; // Closed
    }
    return isActive ? "#22c55e" : "#ef4444"; // Active or Cancelled
  };

  const getStatusText = (isActive: boolean, closedAt: string | null) => {
    if (closedAt) {
      return "Closed";
    }
    return isActive ? "Open" : "Cancelled";
  };

  const getPositionType = (position: ParticipantPosition) => {
    if (!participantAddress) return "Unknown";
    return position.buyer.address.toLowerCase() === participantAddress.toLowerCase() ? "Long" : "Short";
  };

  const getTypeColor = (position: ParticipantPosition) => {
    const type = getPositionType(position);
    return type === "Long" ? "#22c55e" : "#ef4444";
  };

  const formatPrice = (price: bigint) => {
    return (Number(price) / 1e6).toFixed(2); // Convert from wei to USDC
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const handleClosePosition = (positionId: string) => {
    console.log("Closing position:", positionId);
    // TODO: Implement actual close position logic
  };

  if (isLoading) {
    return (
      <PositionsContainer>
        <h3>Positions</h3>
        <div style={{ textAlign: "center", padding: "2rem", color: "#6b7280" }}>
          <p>Loading positions...</p>
        </div>
      </PositionsContainer>
    );
  }

  return (
    <PositionsContainer>
      <h3>Positions</h3>

      <TableContainer>
        <Table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Price</th>
              <th>Start Time</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {positions.map((position) => {
              const positionType = getPositionType(position);
              return (
                <TableRow key={position.id}>
                  <td>
                    <TypeBadge $type={positionType}>{positionType}</TypeBadge>
                  </td>
                  <td>${formatPrice(position.price)}</td>
                  <td>{formatTimestamp(position.startTime)}</td>
                  <td>
                    <StatusBadge $status={getStatusText(position.isActive, position.closedAt)}>
                      {getStatusText(position.isActive, position.closedAt)}
                    </StatusBadge>
                  </td>
                  <td>
                    {position.isActive && !position.closedAt && (
                      <CloseButton onClick={() => handleClosePosition(position.id)}>Close</CloseButton>
                    )}
                  </td>
                </TableRow>
              );
            })}
          </tbody>
        </Table>
      </TableContainer>

      {positions.length === 0 && (
        <EmptyState>
          <p>No positions found</p>
        </EmptyState>
      )}
    </PositionsContainer>
  );
};

const PositionsContainer = styled(SmallWidget)`
  width: 100%;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  
  h3 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: #fff;
  }
`;

const TableContainer = styled("div")`
  width: 100%;
  overflow-x: auto;
  
  &::-webkit-scrollbar {
    height: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 2px;
  }
`;

const Table = styled("table")`
  width: 100%;
  border-collapse: collapse;
  min-width: 500px;
  
  th {
    text-align: left;
    padding: 0.75rem 0.5rem;
    font-size: 0.75rem;
    font-weight: 600;
    color: #a7a9b6;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    white-space: nowrap;
  }
  
  td {
    padding: 0.75rem 0.5rem;
    font-size: 0.875rem;
    color: #fff;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }
`;

const TableRow = styled("tr")`
  &:hover {
    background-color: rgba(255, 255, 255, 0.02);
  }
  
  &:last-child td {
    border-bottom: none;
  }
`;

const TypeBadge = styled("span")<{ $type: string }>`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  background-color: ${(props) => (props.$type === "Long" ? "rgba(34, 197, 94, 0.2)" : "rgba(239, 68, 68, 0.2)")};
  color: ${(props) => (props.$type === "Long" ? "#22c55e" : "#ef4444")};
`;

const StatusBadge = styled("span")<{ $status: string }>`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  background-color: ${(props) => {
    switch (props.$status) {
      case "Open":
        return "rgba(34, 197, 94, 0.2)";
      case "Closed":
        return "rgba(107, 114, 128, 0.2)";
      default:
        return "rgba(107, 114, 128, 0.2)";
    }
  }};
  color: ${(props) => getStatusColor(props.$status)};
`;

const CloseButton = styled("button")`
  padding: 0.25rem 0.5rem;
  background: #ef4444;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background: #dc2626;
  }
  
  &:active {
    background: #b91c1c;
  }
`;

const EmptyState = styled("div")`
  text-align: center;
  padding: 2rem;
  color: #6b7280;
  
  p {
    margin: 0;
    font-size: 0.875rem;
  }
`;

// Helper function for status color
const getStatusColor = (status: string) => {
  switch (status) {
    case "Open":
      return "#22c55e";
    case "Closed":
      return "#6b7280";
    default:
      return "#6b7280";
  }
};
