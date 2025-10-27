import styled from "@mui/material/styles/styled";
import { SmallWidget } from "../../Cards/Cards.styled";
import type { PositionBookPosition } from "../../../hooks/data/usePositionBook";
import { useCreateOrder } from "../../../hooks/data/useCreateOrder";
import { ParticipantPosition } from "../../../hooks/data/useParticipant";

interface PositionsListWidgetProps {
  positions: PositionBookPosition[];
  isLoading?: boolean;
  participantAddress?: `0x${string}`;
}

export const PositionsListWidget = ({ positions, isLoading, participantAddress }: PositionsListWidgetProps) => {
  const { createOrderAsync, isPending } = useCreateOrder();

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

  const getPositionType = (position: PositionBookPosition) => {
    if (!participantAddress) return "Unknown";
    return position.buyer.address.toLowerCase() === participantAddress.toLowerCase() ? "Long" : "Short";
  };

  const getTypeColor = (position: PositionBookPosition) => {
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

  const handleClosePosition = async (groupedPosition: {
    price: bigint;
    startTime: string;
    positionType: string;
    amount: number;
    positions: PositionBookPosition[];
  }) => {
    try {
      // Create opposite order to close the position
      // If it's a Long position, create a Sell order
      // If it's a Short position, create a Buy order
      const isBuy = groupedPosition.positionType === "Short";

      // Calculate delivery date from startTime (assuming 30 days duration)
      const startTimeSeconds = Number(groupedPosition.startTime);
      const deliveryDate = BigInt(startTimeSeconds + 30 * 24 * 60 * 60); // 30 days in seconds

      await createOrderAsync({
        price: groupedPosition.price,
        deliveryDate: deliveryDate,
        quantity: groupedPosition.amount,
        isBuy: isBuy,
      });

      console.log(
        `Created ${isBuy ? "buy" : "sell"} order to close ${groupedPosition.amount} ${groupedPosition.positionType} positions`,
      );
    } catch (err) {
      console.error("Failed to close position:", err);
    }
  };

  // Group positions by price, startTime, and position type
  const groupedPositions = positions.reduce(
    (acc, position) => {
      const positionType = getPositionType(position);
      const key = `${position.price}-${position.startTime}-${positionType}`;

      if (!acc[key]) {
        acc[key] = {
          price: position.price,
          startTime: position.startTime,
          positionType: positionType,
          amount: 0,
          isActive: position.isActive,
          closedAt: position.closedAt,
          positions: [] as ParticipantPosition[],
        };
      }

      acc[key].amount += 1;
      acc[key].positions.push(position);

      return acc;
    },
    {} as Record<
      string,
      {
        price: bigint;
        startTime: string;
        positionType: string;
        amount: number;
        isActive: boolean;
        closedAt: string | null;
        positions: PositionBookPosition[];
      }
    >,
  );

  const groupedPositionsArray = Object.values(groupedPositions);

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
              <th>Amount</th>
              <th>Start Time</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {groupedPositionsArray.map((groupedPosition, index) => (
              <TableRow
                key={`${groupedPosition.price}-${groupedPosition.startTime}-${groupedPosition.positionType}-${index}`}
              >
                <td>
                  <TypeBadge $type={groupedPosition.positionType}>{groupedPosition.positionType}</TypeBadge>
                </td>
                <td>${formatPrice(groupedPosition.price)}</td>
                <td>{groupedPosition.amount}</td>
                <td>{formatTimestamp(groupedPosition.startTime)}</td>
                <td>
                  {groupedPosition.isActive && !groupedPosition.closedAt && (
                    <CloseButton onClick={() => handleClosePosition(groupedPosition)} disabled={isPending}>
                      Close
                    </CloseButton>
                  )}
                </td>
              </TableRow>
            ))}
          </tbody>
        </Table>
      </TableContainer>

      {groupedPositionsArray.length === 0 && (
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
  min-width: 600px;
  
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
  
  &:hover:not(:disabled) {
    background: #dc2626;
  }
  
  &:active:not(:disabled) {
    background: #b91c1c;
  }
  
  &:disabled {
    background: #6b7280;
    cursor: not-allowed;
    opacity: 0.6;
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
