import { useState, useMemo } from "react";
import styled from "@mui/material/styles/styled";
import { SmallWidget } from "../../Cards/Cards.styled";
import { TabSwitch } from "../../TabSwitch";
import { OrdersListWidget } from "./OrdersListWidget";
import { PositionsListWidget } from "./PositionsListWidget";
import { HistoricalOrdersListWidget } from "./HistoricalOrdersListWidget";
import { HistoricalPositionsListWidget } from "./HistoricalPositionsListWidget";
import type { ParticipantOrder } from "../../../hooks/data/useParticipant";
import type { PositionBookPosition } from "../../../hooks/data/usePositionBook";
import { useHistoricalOrders } from "../../../hooks/data/useHistoricalOrders";
import { useHistoricalPositions } from "../../../hooks/data/useHistoricalPositions";
// Commented out: Receive Payment feature
// import { usePaidSellerPositions } from "../../../hooks/data/usePaidSellerPositions";
// import { useModal } from "../../../hooks/useModal";
// import { ModalItem } from "../../Modal";
// import { useWithdrawDeliveryPaymentBatch } from "../../../hooks/data/useWithdrawDeliveryPaymentBatch";
// import { TransactionFormV2 as TransactionForm } from "../../Forms/Shared/MultistepForm";
// import { useQueryClient } from "@tanstack/react-query";
// import { waitForBlockNumberPositionBook } from "../../../hooks/data/usePositionBook";
// import type { TransactionReceipt } from "viem";

type TimeFilter = "OPEN" | "LAST_30_DAYS";

interface OrdersPositionsTabWidgetProps {
  orders: ParticipantOrder[];
  positions: PositionBookPosition[];
  ordersLoading?: boolean;
  positionsLoading?: boolean;
  participantAddress?: `0x${string}`;
  onClosePosition?: (price: string, amount: number, isBuy: boolean) => void;
  participantData?: any;
  minMargin?: bigint | null;
}

export const OrdersPositionsTabWidget = ({
  orders,
  positions,
  ordersLoading,
  positionsLoading,
  participantAddress,
  onClosePosition,
  participantData,
  minMargin,
}: OrdersPositionsTabWidgetProps) => {
  const [activeTab, setActiveTab] = useState<"ORDERS" | "POSITIONS">("ORDERS");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("OPEN");

  // Fetch historical data only when "Last 30 days" is selected
  const isHistoricalMode = timeFilter === "LAST_30_DAYS";
  const historicalOrdersQuery = useHistoricalOrders(participantAddress, isHistoricalMode);
  const historicalPositionsQuery = useHistoricalPositions(participantAddress, isHistoricalMode);

  // Commented out: Receive Payment feature
  // const paidSellerPositionsQuery = usePaidSellerPositions(participantAddress, { refetch: true });
  // const deliveryDatesModal = useModal();
  // const withdrawModal = useModal();
  // const { withdrawDeliveryPaymentBatchAsync, isPending: isWithdrawPending } = useWithdrawDeliveryPaymentBatch();
  // const queryClient = useQueryClient();

  // Get unique deliveryAt values that are older than now
  // const claimableDeliveryDates = useMemo(() => {
  //   if (!paidSellerPositionsQuery.data?.data?.positions) return [];
  //   const now = Math.floor(Date.now() / 1000);
  //   const uniqueDates = new Set<string>();
  //   paidSellerPositionsQuery.data.data.positions.forEach((position) => {
  //     const deliveryAt = Number(position.deliveryAt);
  //     if (deliveryAt < now) {
  //       uniqueDates.add(position.deliveryAt);
  //     }
  //   });
  //   return Array.from(uniqueDates).sort((a, b) => Number(a) - Number(b));
  // }, [paidSellerPositionsQuery.data?.data?.positions]);

  // Show button only if there are claimable delivery dates
  // const hasClaimableDates = claimableDeliveryDates.length > 0;

  const ordersCount = useMemo(() => {
    if (isHistoricalMode) {
      const historicalOrders = historicalOrdersQuery.data?.data || [];
      const unique = new Set<string>();
      historicalOrders.forEach((order) => {
        unique.add(`${order.deliveryAt.toString()}_${order.pricePerDay.toString()}`);
      });
      return unique.size;
    }
    const unique = new Set<string>();
    orders.forEach((order) => {
      unique.add(`${order.deliveryAt.toString()}_${order.pricePerDay.toString()}`);
    });
    return unique.size;
  }, [orders, isHistoricalMode, historicalOrdersQuery.data?.data]);

  const positionsCount = useMemo(() => {
    if (isHistoricalMode) {
      const historicalPositions = historicalPositionsQuery.data?.data || [];
      const unique = new Set<string>();
      historicalPositions.forEach((p) => {
        const isLong = participantAddress && p.buyer.address.toLowerCase() === participantAddress.toLowerCase();
        const pricePerDay = isLong ? p.buyPricePerDay : p.sellPricePerDay;
        unique.add(`${p.deliveryAt.toString()}_${pricePerDay.toString()}`);
      });
      return unique.size;
    }
    const unique = new Set<string>();
    positions.forEach((p) => {
      // Determine position type and use appropriate price
      const isLong = participantAddress && p.buyer.address.toLowerCase() === participantAddress.toLowerCase();
      const pricePerDay = isLong ? p.buyPricePerDay : p.sellPricePerDay;
      unique.add(`${p.deliveryAt.toString()}_${pricePerDay.toString()}`);
    });
    return unique.size;
  }, [positions, participantAddress, isHistoricalMode, historicalPositionsQuery.data?.data]);

  return (
    <TabContainer>
      <Header>
        <TabSwitch
          values={[
            { text: "Orders", value: "ORDERS", count: ordersCount },
            { text: "Positions", value: "POSITIONS", count: positionsCount },
          ]}
          value={activeTab}
          setValue={setActiveTab}
        />
        <TimeFilterSwitch>
          <TimeFilterButton $active={timeFilter === "OPEN"} onClick={() => setTimeFilter("OPEN")}>
            Active
          </TimeFilterButton>
          <TimeFilterButton $active={timeFilter === "LAST_30_DAYS"} onClick={() => setTimeFilter("LAST_30_DAYS")}>
            Last 30 days
          </TimeFilterButton>
        </TimeFilterSwitch>
        {/* Commented out: Receive Payment button */}
        {/* {hasClaimableDates && (
          <ClaimButton onClick={() => withdrawModal.open()} disabled={isWithdrawPending}>
            Receive Payment
          </ClaimButton>
        )} */}
      </Header>

      <Content>
        {activeTab === "ORDERS" && !isHistoricalMode && (
          <OrdersWrapper>
            <OrdersListWidget
              orders={orders}
              isLoading={ordersLoading}
              participantData={participantData}
              minMargin={minMargin}
            />
          </OrdersWrapper>
        )}
        {activeTab === "ORDERS" && isHistoricalMode && (
          <OrdersWrapper>
            <HistoricalOrdersListWidget
              orders={historicalOrdersQuery.data?.data || []}
              isLoading={historicalOrdersQuery.isLoading}
            />
          </OrdersWrapper>
        )}
        {activeTab === "POSITIONS" && !isHistoricalMode && (
          <PositionsWrapper>
            <PositionsListWidget
              positions={positions}
              isLoading={positionsLoading}
              participantAddress={participantAddress}
              onClosePosition={onClosePosition}
            />
          </PositionsWrapper>
        )}
        {activeTab === "POSITIONS" && isHistoricalMode && (
          <PositionsWrapper>
            <HistoricalPositionsListWidget
              positions={historicalPositionsQuery.data?.data || []}
              isLoading={historicalPositionsQuery.isLoading}
              participantAddress={participantAddress}
            />
          </PositionsWrapper>
        )}
      </Content>

      {/* Commented out: Receive Payment modal */}
      {/* <ModalItem open={withdrawModal.isOpen} setOpen={withdrawModal.setOpen}>
        <TransactionForm
          onClose={() => {
            withdrawModal.close();
            paidSellerPositionsQuery.refetch();
          }}
          title="Receive Payment"
          description="Withdraw delivery payments for completed positions"
          reviewForm={() => (
            <div className="space-y-4">
              <p className="text-gray-300 text-sm">
                You are about to withdraw delivery payments for the following {claimableDeliveryDates.length} delivery
                date(s):
              </p>
              <DeliveryDatesList>
                {claimableDeliveryDates.map((deliveryAt) => {
                  const date = new Date(Number(deliveryAt) * 1000);
                  return (
                    <DeliveryDateItem key={deliveryAt}>
                      {date.toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}{" "}
                      ({date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })})
                    </DeliveryDateItem>
                  );
                })}
              </DeliveryDatesList>
            </div>
          )}
          transactionSteps={[
            {
              label: "Withdraw Delivery Payments",
              async action() {
                const deliveryDatesBigInt = claimableDeliveryDates.map((date) => BigInt(date));
                const result = await withdrawDeliveryPaymentBatchAsync({
                  deliveryDates: deliveryDatesBigInt,
                });
                if (!result) throw new Error("Transaction failed");
                return { isSkipped: false, txhash: result };
              },
              postConfirmation: async (receipt: TransactionReceipt) => {
                await waitForBlockNumberPositionBook(BigInt(receipt.blockNumber), queryClient);
              },
            },
          ]}
          resultForm={(props) => (
            <div className="space-y-4">
              <p className="text-gray-300">Your delivery payments have been withdrawn successfully.</p>
              <p className="text-white font-medium mt-2">
                Withdrawn payments for {claimableDeliveryDates.length} delivery date(s)
              </p>
            </div>
          )}
        />
      </ModalItem> */}
    </TabContainer>
  );
};

const TabContainer = styled(SmallWidget)`
  width: 100%;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: start;
  
  h3 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: #fff;
  }
`;

const Header = styled("div")`
  padding: 1.5rem 1.5rem 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

const ClaimButton = styled("button")`
  padding: 0.5rem 1rem;
  background: #4c5a5f;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.1s ease;
  white-space: nowrap;
  
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

const Content = styled("div")`
  width: 100%;
  padding: 0 1.5rem 1.5rem 1.5rem;
`;

const OrdersWrapper = styled("div")`
  width: 100%;
  
  /* Hide the widget's header since we have tabs */
  h3 {
    display: none;
  }
`;

const PositionsWrapper = styled("div")`
  width: 100%;
  
  /* Hide the widget's header since we have tabs */
  h3 {
    display: none;
  }
`;

const DeliveryDatesModalContent = styled("div")`
  padding: 1.5rem;
  color: #fff;
  
  h3 {
    margin: 0 0 1rem 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: #fff;
  }
`;

const DeliveryDatesList = styled("div")`
  max-height: 400px;
  overflow-y: auto;
  margin-bottom: 1.5rem;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 3px;
  }
`;

const DeliveryDateItem = styled("div")`
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  font-size: 0.875rem;
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const ModalActions = styled("div")`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
`;

const CloseButton = styled("button")`
  padding: 0.5rem 1rem;
  background: #4c5a5f;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background: #5a6b70;
  }
`;

const TimeFilterSwitch = styled("div")`
  display: flex;
  gap: 0;
  border: 1px solid rgba(171, 171, 171, 1);
  border-radius: 6px;
  overflow: hidden;
`;

const TimeFilterButton = styled("button")<{ $active: boolean }>`
  padding: 0.5rem 1rem;
  background: ${(props) => (props.$active ? "#4c5a5f" : "transparent")};
  color: #fff;
  border: none;
  font-size: 1.2rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  white-space: nowrap;
  
  &:hover {
    background: ${(props) => (props.$active ? "#4c5a5f" : "rgba(76, 90, 95, 0.5)")};
  }
  
  &:first-of-type {
    border-right: 1px solid rgba(171, 171, 171, 0.5);
  }
`;
