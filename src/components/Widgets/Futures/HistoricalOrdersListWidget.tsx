import styled from "@mui/material/styles/styled";
import { SmallWidget } from "../../Cards/Cards.styled";
import type { HistoricalOrder } from "../../../hooks/data/useHistoricalOrders";

interface HistoricalOrdersListWidgetProps {
  orders: HistoricalOrder[];
  isLoading?: boolean;
}

export const HistoricalOrdersListWidget = ({ orders, isLoading }: HistoricalOrdersListWidgetProps) => {
  const formatPrice = (price: bigint) => {
    return (Number(price) / 1e6).toFixed(2);
  };

  const formatDeliveryDate = (deliveryDate: bigint) => {
    const date = new Date(Number(deliveryDate) * 1000);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Group orders by type, pricePerDay, and deliveryAt
  const groupedOrders = orders.reduce(
    (acc, order) => {
      const key = `${order.isBuy}-${order.pricePerDay}-${order.deliveryAt}`;

      if (!acc[key]) {
        acc[key] = {
          isBuy: order.isBuy,
          pricePerDay: order.pricePerDay,
          deliveryAt: order.deliveryAt,
          amount: 0,
          closedAt: order.closedAt,
        };
      }

      acc[key].amount += 1;

      return acc;
    },
    {} as Record<
      string,
      {
        isBuy: boolean;
        pricePerDay: bigint;
        deliveryAt: bigint;
        amount: number;
        closedAt: string | null;
      }
    >,
  );

  const groupedOrdersArray = Object.values(groupedOrders);

  if (isLoading) {
    return (
      <OrdersContainer>
        <h3>Historical Orders</h3>
        <div style={{ textAlign: "center", padding: "2rem", color: "#6b7280" }}>
          <p>Loading historical orders...</p>
        </div>
      </OrdersContainer>
    );
  }

  return (
    <OrdersContainer>
      <h3>Historical Orders</h3>

      <TableContainer>
        <Table>
          <thead>
            <tr>
              <th>Contract Expiration</th>
              <th>Type</th>
              <th>Price per day</th>
              <th>Quantity</th>
              <th>Closed At</th>
            </tr>
          </thead>
          <tbody>
            {groupedOrdersArray.map((groupedOrder, index) => (
              <TableRow key={`${groupedOrder.isBuy}-${groupedOrder.pricePerDay}-${groupedOrder.deliveryAt}-${index}`}>
                <td>{formatDeliveryDate(groupedOrder.deliveryAt)}</td>
                <td>
                  <TypeBadge $type={groupedOrder.isBuy ? "Long" : "Short"}>
                    {groupedOrder.isBuy ? "Long" : "Short"}
                  </TypeBadge>
                </td>
                <td>{formatPrice(groupedOrder.pricePerDay)} USDC</td>
                <td>{groupedOrder.amount}</td>
                <td>{groupedOrder.closedAt ? formatTimestamp(groupedOrder.closedAt) : "-"}</td>
              </TableRow>
            ))}
          </tbody>
        </Table>
      </TableContainer>

      {groupedOrdersArray.length === 0 && (
        <EmptyState>
          <p>No historical orders found in the last 30 days</p>
        </EmptyState>
      )}
    </OrdersContainer>
  );
};

const OrdersContainer = styled(SmallWidget)`
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
  min-width: 300px;
  
  th {
    text-align: left;
    padding: 0.75rem 0.5rem;
    font-size: 0.75rem;
    font-weight: 600;
    color: #a7a9b6;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    white-space: nowrap;
    
    &:first-child {
      width: 200px;
      min-width: 200px;
    }
  }
  
  td {
    padding: 0.75rem 0.5rem;
    font-size: 0.875rem;
    color: #fff;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    
    &:first-child {
      width: 200px;
      min-width: 200px;
    }
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

const EmptyState = styled("div")`
  text-align: center;
  padding: 2rem;
  color: #6b7280;
  
  p {
    margin: 0;
    font-size: 0.875rem;
  }
`;
