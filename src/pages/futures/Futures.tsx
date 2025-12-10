import { type FC, useState, useRef, useMemo } from "react";
import { useAccount } from "wagmi";
import { FuturesBalanceWidget } from "../../components/Widgets/Futures/FuturesBalanceWidget";
import { FuturesMarketWidget } from "../../components/Widgets/Futures/FuturesMarketWidget";
import { OrderBookTable } from "../../components/Widgets/Futures/OrderBookTable";
import { HashrateChart } from "../../components/Charts/HashrateChart";
import { PlaceOrderWidget } from "../../components/Widgets/Futures/PlaceOrderWidget";
import { OrdersPositionsTabWidget } from "../../components/Widgets/Futures/OrdersPositionsTabWidget";
import { useHashrateIndexData } from "../../hooks/data/useHashRateIndexData";
import { useParticipant } from "../../hooks/data/useParticipant";
import { usePositionBook } from "../../hooks/data/usePositionBook";
import { useFuturesContractSpecs } from "../../hooks/data/useFuturesContractSpecs";
import { useGetMinMargin } from "../../hooks/data/useGetMinMargin";
import { useGetMarketPrice } from "../../hooks/data/useGetMarketPrice";
import { SmallWidget } from "../../components/Cards/Cards.styled";
import type { PositionBookPosition } from "../../hooks/data/usePositionBook";
import styled from "@mui/material/styles/styled";

export const Futures: FC = () => {
  const { isConnected, address } = useAccount();
  const hashrateQuery = useHashrateIndexData();
  const contractSpecsQuery = useFuturesContractSpecs();
  const { data: participantData, isLoading: isParticipantLoading } = useParticipant(address);
  const { data: positionBookData, isLoading: isPositionBookLoading } = usePositionBook(address);

  // Get min margin for address using hook (used for withdrawal form)
  const minMarginQuery = useGetMinMargin(address);
  const minMargin = minMarginQuery.data ?? null;
  const isLoadingMinMargin = minMarginQuery.isLoading;

  // Get market price from contract - polls every 10 seconds
  const {
    data: marketPrice,
    isLoading: isMarketPriceLoading,
    dataFetchedAt: marketPriceFetchedAt,
  } = useGetMarketPrice();

  // Calculate total unrealized PnL from all active positions
  const totalUnrealizedPnL = useMemo(() => {
    if (!marketPrice || !positionBookData?.data?.positions || !address) return null;

    const activePositions = positionBookData.data.positions.filter((p) => p.isActive && !p.closedAt);
    let totalPnL = 0n;

    activePositions.forEach((position: PositionBookPosition) => {
      const isLong = position.buyer.address.toLowerCase() === address.toLowerCase();
      const entryPrice = isLong ? position.buyPricePerDay : position.sellPricePerDay;
      const entryPriceNum = entryPrice;
      const priceDiff = marketPrice - entryPriceNum;

      const positionPnL = isLong ? priceDiff : -priceDiff;
      totalPnL += positionPnL;
    });

    if (Math.abs(Number(totalPnL)) < 1000) {
      return 0n;
    }

    return totalPnL;
  }, [marketPrice, positionBookData?.data?.positions, address]);

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

  const handleOrderBookClick = (price: string, amount: number | null) => {
    setSelectedPrice(price);
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
    <FuturesContainer>
      {/* Row 1: Balance Widget (60%) and Stats Widget (40%) */}
      <BalanceWidgetArea>
        <FuturesBalanceWidget
          minMargin={minMargin}
          isLoadingMinMargin={isLoadingMinMargin}
          unrealizedPnL={totalUnrealizedPnL}
        />
      </BalanceWidgetArea>

      <StatsWidgetArea>
        <FuturesMarketWidget contractSpecsQuery={contractSpecsQuery} />
      </StatsWidgetArea>

      {/* Row 2: Chart (60%) */}
      <ChartArea>
        <SmallWidget className="w-full" style={{ marginBottom: 0, paddingLeft: 5, paddingRight: 10 }}>
          <HashrateChart
            data={hashrateQuery.data || []}
            isLoading={hashrateQuery.isLoading}
            marketPrice={marketPrice}
            marketPriceFetchedAt={marketPriceFetchedAt}
          />
        </SmallWidget>
      </ChartArea>

      {/* Row 3: Place Order (60%) - only shown when connected */}
      {isConnected && (
        <PlaceOrderArea>
          <PlaceOrderWidget
            externalPrice={selectedPrice}
            externalAmount={selectedAmount}
            externalDeliveryDate={selectedDeliveryDate}
            externalIsBuy={selectedIsBuy}
            highlightTrigger={highlightTrigger}
            contractSpecsQuery={contractSpecsQuery}
            participantData={participantData?.data}
            latestPrice={marketPrice ?? null}
            onOrderPlaced={async () => {
              await minMarginQuery.refetch();
            }}
          />
        </PlaceOrderArea>
      )}

      {/* Order Book (40%) - spans rows 2 and 3 */}
      <OrderBookArea $isConnected={isConnected}>
        <OrderBookTable
          onRowClick={handleOrderBookClick}
          onDeliveryDateChange={handleDeliveryDateChange}
          contractSpecsQuery={contractSpecsQuery}
          previousOrderBookStateRef={previousOrderBookStateRef}
        />
      </OrderBookArea>

      {/* Row 4: Orders and Positions List - Full width */}
      {isConnected && (
        <OrdersPositionsArea>
          <OrdersPositionsTabWidget
            orders={participantData?.data?.orders || []}
            positions={positionBookData?.data?.positions || []}
            ordersLoading={isParticipantLoading}
            positionsLoading={isPositionBookLoading}
            participantAddress={address}
            onClosePosition={handleClosePosition}
          />
        </OrdersPositionsArea>
      )}
    </FuturesContainer>
  );
};

// Grid Container with explicit grid structure
const FuturesContainer = styled("div")`
  display: grid;
  grid-template-columns: 3fr 2fr;
  grid-auto-rows: auto;
  gap: 1.5rem;
  width: 100%;

  /* Medium screens: Adjust column ratio for better fit */
  @media (max-width: 1400px) {
    grid-template-columns: 3fr 2fr;
  }

  /* Tablet: Stack in single column */
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

// Balance Widget - Row 1, Column 1 (60% width)
const BalanceWidgetArea = styled("div")`
  grid-column: 1;
  grid-row: 1;
  width: 100%;
  min-width: 0;

  > * {
    width: 100%;
    height: 100%;
  }

  @media (max-width: 1024px) {
    grid-column: 1;
    grid-row: auto;
  }
`;

// Stats Widget - Row 1, Column 2 (40% width)
const StatsWidgetArea = styled("div")`
  grid-column: 2;
  grid-row: 1;
  width: 100%;
  min-width: 0;

  > * {
    width: 100%;
    height: 100%;
  }

  @media (max-width: 1024px) {
    grid-column: 1;
    grid-row: auto;
  }
`;

// Chart Area - Row 2, Column 1 (60% width)
const ChartArea = styled("div")`
  grid-column: 1;
  grid-row: 2;
  width: 100%;
  min-width: 0;

  > * {
    width: 100%;
  }

  @media (max-width: 1024px) {
    grid-column: 1;
    grid-row: auto;
  }
`;

// Place Order Area - Row 3, Column 1 (60% width)
const PlaceOrderArea = styled("div")`
  grid-column: 1;
  grid-row: 3;
  width: 100%;
  min-width: 0;

  > * {
    width: 100%;
  }

  @media (max-width: 1024px) {
    grid-column: 1;
    grid-row: auto;
  }
`;

// Order Book Area - Rows 2-3, Column 2 (40% width, spans 2 rows)
const OrderBookArea = styled("div")<{ $isConnected: boolean }>`
  grid-column: 2;
  grid-row: ${(props) => (props.$isConnected ? "2 / 4" : "2 / 3")};
  width: 100%;
  min-width: 0;
  height: 100%;

  > * {
    width: 100%;
    height: 100%;
  }

  @media (max-width: 1024px) {
    grid-column: 1;
    grid-row: auto;
    height: auto;
  }
`;

// Orders and Positions Area - Row 4, Full width
const OrdersPositionsArea = styled("div")`
  grid-column: 1 / -1;
  grid-row: 4;
  width: 100%;
  min-width: 0;

  > * {
    width: 100%;
  }

  @media (max-width: 1024px) {
    grid-column: 1;
    grid-row: auto;
  }
`;
