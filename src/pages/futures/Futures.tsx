import { type FC } from "react";
import { FuturesPortfolioWidget } from "../../components/Widgets/Futures/FuturesPortfolioWidget";
import { FuturesMarketWidget } from "../../components/Widgets/Futures/FuturesMarketWidget";
import { OrderBookTable } from "../../components/Widgets/Futures/OrderBookTable";
import { HashpriceIndexChart } from "../../components/Widgets/Futures/HashpriceIndexChart";
import { PlaceOrderWidget } from "../../components/Widgets/Futures/PlaceOrderWidget";
import { OrdersListWidget } from "../../components/Widgets/Futures/OrdersListWidget";
import { FeedWidget } from "../../components/Widgets/Futures/FeedWidget";
import { WidgetsWrapper } from "../marketplace/styled";

export const Futures: FC = () => {
  return (
    <div className="flex gap-6 w-full">
      {/* Main content area - all existing blocks */}
      <div className="flex-1 flex flex-col">
        <WidgetsWrapper>
          <FuturesPortfolioWidget />
          <FuturesMarketWidget />
        </WidgetsWrapper>

        {/* Chart and Table Section */}
        <div className="flex flex-col lg:flex-row gap-6 mb-8 w-full">
          <div className="flex-1 w-full">
            <HashpriceIndexChart />
          </div>
          <div className="flex-1 w-full">
            <OrderBookTable />
          </div>
        </div>

        {/* Order Management Section */}
        <div className="flex flex-col lg:flex-row gap-6 mb-8 w-full">
          <div className="flex-1 w-full">
            <PlaceOrderWidget />
          </div>
          <div className="flex-1 w-full">
            <OrdersListWidget />
          </div>
        </div>
      </div>

      {/* Feed widget in right corner */}
      <div className="flex-shrink-0">
        <FeedWidget />
      </div>
    </div>
  );
};
