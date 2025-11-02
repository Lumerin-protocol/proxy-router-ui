import styled from "@mui/material/styles/styled";
import { SmallWidget } from "../../Cards/Cards.styled";
import type { ParticipantOrder } from "../../../hooks/data/useParticipant";
import { useCloseOrder } from "../../../hooks/data/useCloseOrder";

interface OrdersListWidgetProps {
  orders: ParticipantOrder[];
  isLoading?: boolean;
}

export const OrdersListWidget = ({ orders, isLoading }: OrdersListWidgetProps) => {
  const { closeOrdersAsync, isPending } = useCloseOrder();
  const getStatusColor = (isActive: boolean, closedAt: string | null) => {
    if (closedAt) {
      return "#3b82f6"; // Filled/Closed
    }
    return isActive ? "#22c55e" : "#ef4444"; // Active or Cancelled
  };

  // const getStatusText = (isActive: boolean, closedAt: string | null) => {
  //   if (closedAt) {
  //     return "Filled";
  //   }
  //   return isActive ? "Active" : "Cancelled";
  // };

  const getTypeColor = (isBuy: boolean) => {
    return isBuy ? "#22c55e" : "#ef4444";
  };

  const formatPrice = (price: bigint) => {
    return (Number(price) / 1e6).toFixed(2); // Convert from wei to USDC
  };

  const formatDeliveryDate = (deliveryDate: bigint) => {
    const date = new Date(Number(deliveryDate) * 1000);
    return date.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
  };

  const handleCloseOrder = async (orderIds: string[]) => {
    try {
      // Cast to 0x-prefixed bytes32 strings
      const ids = orderIds as unknown as `0x${string}`[];
      await closeOrdersAsync({ orderIds: ids });
    } catch (e) {
      console.error("Failed to close orders", e);
    }
  };

  // Group orders by type, price, and delivery date
  const groupedOrders = orders.reduce(
    (acc, order) => {
      const key = `${order.isBuy}-${order.price}-${order.deliveryDate}`;

      if (!acc[key]) {
        acc[key] = {
          isBuy: order.isBuy,
          price: order.price,
          deliveryDate: order.deliveryDate,
          amount: 0,
          isActive: order.isActive,
          closedAt: order.closedAt,
          orderIds: [] as string[],
        };
      }

      acc[key].amount += 1;
      acc[key].orderIds.push(order.id);

      return acc;
    },
    {} as Record<
      string,
      {
        isBuy: boolean;
        price: bigint;
        deliveryDate: bigint;
        amount: number;
        isActive: boolean;
        closedAt: string | null;
        orderIds: string[];
      }
    >,
  );

  const groupedOrdersArray = Object.values(groupedOrders);

  if (isLoading) {
    return (
      <OrdersContainer>
        <h3>Orders</h3>
        <div style={{ textAlign: "center", padding: "2rem", color: "#6b7280" }}>
          <p>Loading orders...</p>
        </div>
      </OrdersContainer>
    );
  }

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
              <th>Delivery Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {groupedOrdersArray.map((groupedOrder, index) => (
              <TableRow key={`${groupedOrder.isBuy}-${groupedOrder.price}-${groupedOrder.deliveryDate}-${index}`}>
                <td>
                  <TypeBadge $type={groupedOrder.isBuy ? "Long" : "Short"}>
                    {groupedOrder.isBuy ? "Long" : "Short"}
                  </TypeBadge>
                </td>
                <td>{formatPrice(groupedOrder.price)} USDC</td>
                <td>{groupedOrder.amount}</td>
                <td>{formatDeliveryDate(groupedOrder.deliveryDate)}</td>
                <td>
                  {groupedOrder.isActive && !groupedOrder.closedAt && (
                    <CloseButton onClick={() => handleCloseOrder(groupedOrder.orderIds)} disabled={isPending}>
                      Close
                    </CloseButton>
                  )}
                </td>
              </TableRow>
            ))}
          </tbody>
        </Table>
      </TableContainer>

      {groupedOrdersArray.length === 0 && (
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
