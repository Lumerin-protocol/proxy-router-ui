import { type FC, useState } from "react";
import { useAccount } from "wagmi";
import { FuturesBalanceWidget } from "../../components/Widgets/Futures/FuturesBalanceWidget";
import { FuturesMarketWidget } from "../../components/Widgets/Futures/FuturesMarketWidget";
import { OrderBookTable } from "../../components/Widgets/Futures/OrderBookTable";
import { HashrateChart } from "../../components/Charts/HashrateChart";
import { PlaceOrderWidget } from "../../components/Widgets/Futures/PlaceOrderWidget";
import { OrdersListWidget } from "../../components/Widgets/Futures/OrdersListWidget";
import { FeedWidget } from "../../components/Widgets/Futures/FeedWidget";
import { WidgetsWrapper } from "../marketplace/styled";
import { useHashrateIndexData } from "../../hooks/data/useHashRateIndexData";

export const Futures: FC = () => {
  const { isConnected } = useAccount();
  const hashrateQuery = useHashrateIndexData();

  // State for order book selection
  const [selectedPrice, setSelectedPrice] = useState<string | undefined>();
  const [selectedAmount, setSelectedAmount] = useState<string | undefined>();

  const handleOrderBookClick = (price: number, amount: number | null) => {
    setSelectedPrice(price.toString());
    setSelectedAmount(amount ? amount.toString() : undefined);
  };

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
                <PlaceOrderWidget externalPrice={selectedPrice} externalAmount={selectedAmount} />
              </div>
            )}
          </div>

          {/* Right Column - Order Book (1/4 width) */}
          <div className="w-full lg:w-[40%]">
            <OrderBookTable onRowClick={handleOrderBookClick} />
          </div>
        </div>

        {/* Orders List Section - Only show when wallet is connected */}
        {isConnected && (
          <div className="w-full mb-8">
            <OrdersListWidget />
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
