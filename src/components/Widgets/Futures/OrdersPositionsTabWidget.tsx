import { useState } from "react";
import styled from "@mui/material/styles/styled";
import { SmallWidget } from "../../Cards/Cards.styled";
import { TabSwitch } from "../../TabSwitch";
import { OrdersListWidget } from "./OrdersListWidget";
import { PositionsListWidget } from "./PositionsListWidget";
import type { ParticipantOrder } from "../../../hooks/data/useParticipant";
import type { PositionBookPosition } from "../../../hooks/data/usePositionBook";

interface OrdersPositionsTabWidgetProps {
  orders: ParticipantOrder[];
  positions: PositionBookPosition[];
  ordersLoading?: boolean;
  positionsLoading?: boolean;
  participantAddress?: `0x${string}`;
  onClosePosition?: (price: string, amount: number, isBuy: boolean) => void;
}

export const OrdersPositionsTabWidget = ({
  orders,
  positions,
  ordersLoading,
  positionsLoading,
  participantAddress,
  onClosePosition,
}: OrdersPositionsTabWidgetProps) => {
  const [activeTab, setActiveTab] = useState<"ORDERS" | "POSITIONS">("ORDERS");

  return (
    <TabContainer>
      <Header>
        <TabSwitch
          values={[
            { text: "Open Orders", value: "ORDERS", count: orders.length },
            { text: "Positions", value: "POSITIONS", count: positions.length },
          ]}
          value={activeTab}
          setValue={setActiveTab}
        />
      </Header>

      <Content>
        {activeTab === "ORDERS" && (
          <OrdersWrapper>
            <OrdersListWidget orders={orders} isLoading={ordersLoading} />
          </OrdersWrapper>
        )}
        {activeTab === "POSITIONS" && (
          <PositionsWrapper>
            <PositionsListWidget
              positions={positions}
              isLoading={positionsLoading}
              participantAddress={participantAddress}
              onClosePosition={onClosePosition}
            />
          </PositionsWrapper>
        )}
      </Content>
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
  justify-content: flex-start;
  align-items: center;
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
