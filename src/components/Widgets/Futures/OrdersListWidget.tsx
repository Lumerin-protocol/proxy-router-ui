import { useState } from "react";
import styled from "@mui/material/styles/styled";
import { SmallWidget } from "../../Cards/Cards.styled";
import type { ParticipantOrder } from "../../../hooks/data/useParticipant";
import { useModal } from "../../../hooks/useModal";
import { ModalItem } from "../../Modal";
import { ModifyOrderForm } from "../../Forms/ModifyOrderForm";
import { CloseOrderForm } from "../../Forms/CloseOrderForm";
import { ServerStackIcon } from "@heroicons/react/24/outline";
import Tooltip from "@mui/material/Tooltip";
import { getMinMarginForPositionManual } from "../../../hooks/data/getMinMarginForPositionManual";
import { useGetMarketPrice } from "../../../hooks/data/useGetMarketPrice";
import { useFuturesContractSpecs } from "../../../hooks/data/useFuturesContractSpecs";

interface OrdersListWidgetProps {
  orders: ParticipantOrder[];
  isLoading?: boolean;
  participantData?: any;
  minMargin?: bigint | null;
}

export const OrdersListWidget = ({ orders, isLoading, participantData, minMargin }: OrdersListWidgetProps) => {
  const modifyModal = useModal();
  const closeModal = useModal();
  const { data: marketPrice } = useGetMarketPrice();
  const contractSpecsQuery = useFuturesContractSpecs();
  const [selectedOrder, setSelectedOrder] = useState<{
    order: ParticipantOrder;
    orderIds: string[];
    currentQuantity: number;
  } | null>(null);
  const [selectedCloseOrder, setSelectedCloseOrder] = useState<{
    isBuy: boolean;
    pricePerDay: bigint;
    deliveryAt: bigint;
    amount: number;
  } | null>(null);
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
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get latest price from market price hook
  const latestPrice = marketPrice ?? null;

  // Get contract specs
  const marginPercent = contractSpecsQuery.data?.data?.liquidationMarginPercent ?? 20;
  const deliveryDurationDays = contractSpecsQuery.data?.data?.deliveryDurationDays ?? 7;

  // Get newest item price for high price validation
  const newestItemPrice = marketPrice ? Number(marketPrice) / 1e6 : null;

  // Calculate margin for an order
  const calculateMargin = (pricePerDay: bigint, amount: number, isBuy: boolean): bigint | null => {
    if (!latestPrice) return null;
    const qty = isBuy ? amount : -amount;
    return getMinMarginForPositionManual(pricePerDay, qty, latestPrice, marginPercent, deliveryDurationDays);
  };

  const formatMargin = (margin: bigint | null): string => {
    if (margin === null) return "-";
    return `${(Number(margin) / 1e6).toFixed(2)} USDC`;
  };

  const handleCloseOrder = (groupedOrder: {
    isBuy: boolean;
    pricePerDay: bigint;
    deliveryAt: bigint;
    amount: number;
  }) => {
    setSelectedCloseOrder(groupedOrder);
    closeModal.open();
  };

  const handleModifyOrder = (order: ParticipantOrder, orderIds: string[], currentQuantity: number) => {
    setSelectedOrder({ order, orderIds, currentQuantity });
    modifyModal.open();
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
          destURL: order.destURL,
          amount: 0,
          isActive: order.isActive,
          closedAt: order.closedAt,
          orderIds: [] as string[],
          firstOrder: order, // Store reference to first order for modify form
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
        pricePerDay: bigint;
        deliveryAt: bigint;
        destURL: string;
        amount: number;
        isActive: boolean;
        closedAt: string | null;
        orderIds: string[];
        firstOrder: ParticipantOrder;
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
              <th>Contract Expiration</th>
              <th>Type</th>
              <th>Price per day</th>
              <th>Quantity</th>
              <th>Margin</th>
              <th>Destination</th>
              <th>Actions</th>
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
                <td>
                  {formatMargin(calculateMargin(groupedOrder.pricePerDay, groupedOrder.amount, groupedOrder.isBuy))}
                </td>
                <td>
                  {groupedOrder.destURL ? (
                    <Tooltip title={groupedOrder.destURL}>
                      <DestURLCell>
                        <ServerStackIcon width={20} height={20} />
                      </DestURLCell>
                    </Tooltip>
                  ) : (
                    <span>---</span>
                  )}
                </td>
                <td>
                  {groupedOrder.isActive && !groupedOrder.closedAt && (
                    <ActionButtons>
                      <ModifyButton
                        onClick={() =>
                          handleModifyOrder(groupedOrder.firstOrder, groupedOrder.orderIds, groupedOrder.amount)
                        }
                      >
                        Modify
                      </ModifyButton>
                      <CloseButton onClick={() => handleCloseOrder(groupedOrder)}>Close</CloseButton>
                    </ActionButtons>
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

      {selectedOrder && (
        <ModalItem open={modifyModal.isOpen} setOpen={modifyModal.setOpen}>
          <ModifyOrderForm
            order={selectedOrder.order}
            orderIds={selectedOrder.orderIds}
            currentQuantity={selectedOrder.currentQuantity}
            participantData={participantData}
            latestPrice={latestPrice}
            marginPercent={marginPercent}
            deliveryDurationDays={deliveryDurationDays}
            minMargin={minMargin}
            newestItemPrice={newestItemPrice}
            closeForm={() => {
              modifyModal.close();
              setSelectedOrder(null);
            }}
          />
        </ModalItem>
      )}

      {selectedCloseOrder && (
        <ModalItem open={closeModal.isOpen} setOpen={closeModal.setOpen}>
          <CloseOrderForm
            isBuy={selectedCloseOrder.isBuy}
            pricePerDay={selectedCloseOrder.pricePerDay}
            deliveryAt={selectedCloseOrder.deliveryAt}
            amount={selectedCloseOrder.amount}
            closeForm={() => {
              closeModal.close();
              setSelectedCloseOrder(null);
            }}
          />
        </ModalItem>
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

const DestURLCell = styled("span")`
  display: inline-block;
  max-width: 200px;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #a7a9b6;
  font-size: 0.875rem;
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

const ActionButtons = styled("div")`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const ModifyButton = styled("button")`
  padding: 0.5rem 0.875rem;
  background: #4c5a5f;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.1s ease;
  
  &:hover:not(:disabled) {
    background: #5a6b70;
    transform: translateY(-1px);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    background: #6b7280;
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const CloseButton = styled("button")`
  padding: 0.5rem 0.875rem;
  background: #4c5a5f;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.1s ease;
  
  &:hover:not(:disabled) {
    background: #5a6b70;
    transform: translateY(-1px);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
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
