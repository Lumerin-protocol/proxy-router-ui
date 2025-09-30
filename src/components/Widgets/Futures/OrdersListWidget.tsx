import styled from "@mui/material/styles/styled";
import { SmallWidget } from "../../Cards/Cards.styled";
import { useState } from "react";

interface Order {
  id: string;
  type: "Buy" | "Sell";
  price: string;
  amount: string;
  deliveryDate: string;
  status: "Active" | "Filled" | "Cancelled";
}

export const OrdersListWidget = () => {
  // Dummy orders data
  const [orders] = useState<Order[]>([
    {
      id: "1",
      type: "Sell",
      price: "5.00",
      amount: "3",
      deliveryDate: "September",
      status: "Active",
    },
    {
      id: "2",
      type: "Buy",
      price: "4.85",
      amount: "5",
      deliveryDate: "October",
      status: "Active",
    },
    {
      id: "3",
      type: "Sell",
      price: "5.15",
      amount: "2",
      deliveryDate: "September",
      status: "Filled",
    },
    {
      id: "4",
      type: "Buy",
      price: "4.70",
      amount: "4",
      deliveryDate: "November",
      status: "Active",
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "#22c55e";
      case "Filled":
        return "#3b82f6";
      case "Cancelled":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const getTypeColor = (type: string) => {
    return type === "Buy" ? "#22c55e" : "#ef4444";
  };

  return (
    <OrdersContainer>
      <h3>Orders</h3>

      <TableContainer>
        <Table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Price</th>
              <th>Amount</th>
              <th>Delivery date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <td>
                  <TypeBadge $type={order.type}>{order.type}</TypeBadge>
                </td>
                <td>${order.price}</td>
                <td>{order.amount}</td>
                <td>{order.deliveryDate}</td>
                <td>
                  <StatusBadge $status={order.status}>{order.status}</StatusBadge>
                </td>
              </TableRow>
            ))}
          </tbody>
        </Table>
      </TableContainer>

      {orders.length === 0 && (
        <EmptyState>
          <p>No orders found</p>
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
  min-width: 400px;
  
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
  background-color: ${(props) => (props.$type === "Buy" ? "rgba(34, 197, 94, 0.2)" : "rgba(239, 68, 68, 0.2)")};
  color: ${(props) => (props.$type === "Buy" ? "#22c55e" : "#ef4444")};
`;

const StatusBadge = styled("span")<{ $status: string }>`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  background-color: ${(props) => {
    switch (props.$status) {
      case "Active":
        return "rgba(34, 197, 94, 0.2)";
      case "Filled":
        return "rgba(59, 130, 246, 0.2)";
      case "Cancelled":
        return "rgba(239, 68, 68, 0.2)";
      default:
        return "rgba(107, 114, 128, 0.2)";
    }
  }};
  color: ${(props) => getStatusColor(props.$status)};
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
    case "Active":
      return "#22c55e";
    case "Filled":
      return "#3b82f6";
    case "Cancelled":
      return "#ef4444";
    default:
      return "#6b7280";
  }
};
