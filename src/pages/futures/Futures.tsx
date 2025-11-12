import { type FC, useState, useRef } from "react";
import { useAccount } from "wagmi";
import { FuturesBalanceWidget } from "../../components/Widgets/Futures/FuturesBalanceWidget";
import { FuturesMarketWidget } from "../../components/Widgets/Futures/FuturesMarketWidget";
import { OrderBookTable } from "../../components/Widgets/Futures/OrderBookTable";
import { HashrateChart } from "../../components/Charts/HashrateChart";
import { PlaceOrderWidget } from "../../components/Widgets/Futures/PlaceOrderWidget";
import { OrdersPositionsTabWidget } from "../../components/Widgets/Futures/OrdersPositionsTabWidget";
import { FeedWidget } from "../../components/Widgets/Futures/FeedWidget";
import { WidgetsWrapper } from "../marketplace/styled";
import { useHashrateIndexData } from "../../hooks/data/useHashRateIndexData";
import { useParticipant } from "../../hooks/data/useParticipant";
import { usePositionBook } from "../../hooks/data/usePositionBook";
import { useFuturesContractSpecs } from "../../hooks/data/useFuturesContractSpecs";

export const Futures: FC = () => {
  const { isConnected, address } = useAccount();
  const hashrateQuery = useHashrateIndexData();
  const contractSpecsQuery = useFuturesContractSpecs();
  const { data: participantData, isLoading: isParticipantLoading } = useParticipant(address);
  const { data: positionBookData, isLoading: isPositionBookLoading } = usePositionBook(address);

  // State for order book selection
  const [selectedPrice, setSelectedPrice] = useState<string | undefined>();
  const [selectedAmount, setSelectedAmount] = useState<number | undefined>();
  const [selectedDeliveryDate, setSelectedDeliveryDate] = useState<number | undefined>();
  const [selectedIsBuy, setSelectedIsBuy] = useState<boolean | undefined>();
  const [highlightTrigger, setHighlightTrigger] = useState(0);

  // Track previous order book state for change detection
  const previousOrderBookStateRef = useRef<Map<number, { bidUnits: number | null; askUnits: number | null }>>(
    new Map(),
  );

  const handleOrderBookClick = (price: number, amount: number | null) => {
    setSelectedPrice(price.toString());
    setSelectedAmount(amount ? amount : undefined);
  };

  const handleDeliveryDateChange = (deliveryDate: number | undefined) => {
    setSelectedDeliveryDate(deliveryDate);
  };

  const handleClosePosition = (price: string, amount: number, isBuy: boolean) => {
    setSelectedPrice(price);
    setSelectedAmount(amount);
    setSelectedIsBuy(isBuy);
    // Increment trigger to force highlight update
    setHighlightTrigger((prev) => prev + 1);
  };

  return (
    <div className="flex gap-6 w-full">
      {/* Main content area - all existing blocks */}
      <div className="flex-1 flex flex-col">
        <WidgetsWrapper>
          <FuturesBalanceWidget />
          <FuturesMarketWidget contractSpecsQuery={contractSpecsQuery} />
        </WidgetsWrapper>

        {/* Chart, Place Order, and Order Book Section */}
        <div className="flex flex-col lg:flex-row gap-6 mb-8 w-full">
          {/* Left Column - Chart and Place Order (3/4 width) */}
          <div className="flex flex-col gap-6 w-full lg:w-[60%]">
            <div className="w-full">
              <HashrateChart data={hashrateQuery.data || []} isLoading={hashrateQuery.isLoading} />
            </div>
            {isConnected && (
              <div className="w-full">
                <PlaceOrderWidget
                  externalPrice={selectedPrice}
                  externalAmount={selectedAmount}
                  externalDeliveryDate={selectedDeliveryDate}
                  externalIsBuy={selectedIsBuy}
                  highlightTrigger={highlightTrigger}
                  contractSpecsQuery={contractSpecsQuery}
                />
              </div>
            )}
          </div>

          {/* Right Column - Order Book (1/4 width) */}
          <div className="w-full lg:w-[40%]">
            <OrderBookTable
              onRowClick={handleOrderBookClick}
              onDeliveryDateChange={handleDeliveryDateChange}
              contractSpecsQuery={contractSpecsQuery}
              previousOrderBookStateRef={previousOrderBookStateRef}
            />
          </div>
        </div>

        {/* Orders and Positions List Section - Only show when wallet is connected */}
        {isConnected && (
          <div className="w-full mb-8">
            <OrdersPositionsTabWidget
              orders={participantData?.data?.orders || []}
              positions={positionBookData?.data?.positions || []}
              ordersLoading={isParticipantLoading}
              positionsLoading={isPositionBookLoading}
              participantAddress={address}
              onClosePosition={handleClosePosition}
            />
          </div>
        )}
      </div>

      {/* Feed widget in right corner
      <div className="flex-shrink-0">
        <FeedWidget />
      </div> */}
    </div>
  );
};
