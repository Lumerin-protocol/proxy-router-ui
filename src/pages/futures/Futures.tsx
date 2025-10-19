import { type FC, useState } from "react";
import { useAccount } from "wagmi";
import { FuturesBalanceWidget } from "../../components/Widgets/Futures/FuturesBalanceWidget";
import { FuturesMarketWidget } from "../../components/Widgets/Futures/FuturesMarketWidget";
import { OrderBookTable } from "../../components/Widgets/Futures/OrderBookTable";
import { HashrateChart } from "../../components/Charts/HashrateChart";
import { PlaceOrderWidget } from "../../components/Widgets/Futures/PlaceOrderWidget";
import { OrdersListWidget } from "../../components/Widgets/Futures/OrdersListWidget";
import { PositionsListWidget } from "../../components/Widgets/Futures/PositionsListWidget";
import { FeedWidget } from "../../components/Widgets/Futures/FeedWidget";
import { WidgetsWrapper } from "../marketplace/styled";
import { useHashrateIndexData } from "../../hooks/data/useHashRateIndexData";
import { useFuturesContractSpecs } from "../../hooks/data/useFuturesContractSpecs";
import { useParticipant } from "../../hooks/data/useParticipant";

export const Futures: FC = () => {
  const { isConnected, address } = useAccount();
  const hashrateQuery = useHashrateIndexData();
  const contractSpecsQuery = useFuturesContractSpecs();
  const participantQuery = useParticipant(address);

  // State for order book selection
  const [selectedPrice, setSelectedPrice] = useState<string | undefined>();
  const [selectedAmount, setSelectedAmount] = useState<number | undefined>();
  const [selectedDeliveryDate, setSelectedDeliveryDate] = useState<number | undefined>();

  const handleOrderBookClick = (price: number, amount: number | null) => {
    setSelectedPrice(price.toString());
    setSelectedAmount(amount ? amount : undefined);
  };

  const handleDeliveryDateChange = (deliveryDate: number | undefined) => {
    setSelectedDeliveryDate(deliveryDate);
  };

  // Calculate order book data based on hashrate query newest item
  const calculateOrderBookData = () => {
    if (!hashrateQuery.data || !contractSpecsQuery.data?.data) {
      return [];
    }

    const hashrateData = hashrateQuery.data;
    const priceLadderStep = Number(contractSpecsQuery.data.data.priceLadderStep) / 1e6; // Convert from wei to USDC

    // Get the newest item by date (last item in the array since it's ordered by updatedAt asc)
    const newestItem = hashrateData[hashrateData.length - 1];
    if (!newestItem || !newestItem.priceToken) {
      return [];
    }

    const rawPrice = Number(newestItem.priceToken) / 1e6; // Convert from wei to USDC
    // Round to the nearest multiple of priceLadderStep
    const basePrice = Math.round(rawPrice / priceLadderStep) * priceLadderStep;
    const orderBookData = [];

    // Create 10 items before the base price
    for (let i = 10; i >= 1; i--) {
      const price = basePrice - i * priceLadderStep;
      orderBookData.push({
        bidUnits: null,
        price: price,
        askUnits: null,
      });
    }

    // Add the base price
    orderBookData.push({
      bidUnits: null,
      price: basePrice,
      askUnits: null,
    });

    // Create 10 items after the base price
    for (let i = 1; i <= 10; i++) {
      const price = basePrice + i * priceLadderStep;
      orderBookData.push({
        bidUnits: null,
        price: price,
        askUnits: null,
      });
    }

    return orderBookData;
  };

  const orderBookData = calculateOrderBookData();

  return (
    <div className="flex gap-6 w-full">
      {/* Main content area - all existing blocks */}
      <div className="flex-1 flex flex-col">
        <WidgetsWrapper>
          <FuturesBalanceWidget />
          <FuturesMarketWidget />
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
                />
              </div>
            )}
          </div>

          {/* Right Column - Order Book (1/4 width) */}
          <div className="w-full lg:w-[40%]">
            <OrderBookTable
              onRowClick={handleOrderBookClick}
              onDeliveryDateChange={handleDeliveryDateChange}
              orderBookData={orderBookData}
            />
          </div>
        </div>

        {/* Orders and Positions List Section - Only show when wallet is connected */}
        {isConnected && (
          <div className="w-full mb-8">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1">
                <OrdersListWidget
                  orders={participantQuery.data?.data?.orders || []}
                  isLoading={participantQuery.isLoading}
                />
              </div>
              <div className="flex-1">
                <PositionsListWidget
                  positions={participantQuery.data?.data?.positions || []}
                  isLoading={participantQuery.isLoading}
                  participantAddress={address}
                />
              </div>
            </div>
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
