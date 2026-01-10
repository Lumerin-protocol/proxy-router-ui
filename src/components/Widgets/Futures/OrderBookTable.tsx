import styled from "@mui/material/styles/styled";
import { SmallWidget } from "../../Cards/Cards.styled";
import { useState, useEffect, useRef, useMemo } from "react";
import { useGetDeliveryDates } from "../../../hooks/data/useGetDeliveryDates";
import { useAggregateOrderBook } from "../../../hooks/data/useAggregateOrderBook";
import { useGetMarketPrice } from "../../../hooks/data/useGetMarketPrice";
import { createFinalOrderBookData } from "./orderBookHelpers";
import type { UseQueryResult } from "@tanstack/react-query";
import type { GetResponse } from "../../../gateway/interfaces";
import type { FuturesContractSpecs } from "../../../hooks/data/useFuturesContractSpecs";

interface OrderBookTableProps {
  onRowClick?: (price: string, amount: number | null) => void;
  onDeliveryDateChange?: (deliveryDate: number | undefined) => void;
  contractSpecsQuery: UseQueryResult<GetResponse<FuturesContractSpecs>, Error>;
  previousOrderBookStateRef: React.MutableRefObject<Map<number, { bidUnits: number | null; askUnits: number | null }>>;
}

export const OrderBookTable = ({
  onRowClick,
  onDeliveryDateChange,
  contractSpecsQuery,
  previousOrderBookStateRef,
}: OrderBookTableProps) => {
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  // Track previous basePrice to detect changes
  const previousBasePriceRef = useRef<number | null>(null);
  const [priceHighlights, setPriceHighlights] = useState<Map<number, { highlightBid: boolean; highlightAsk: boolean }>>(
    new Map(),
  );

  const { data: deliveryDatesRaw, isLoading, isError } = useGetDeliveryDates();
  const { data: marketPrice } = useGetMarketPrice();

  // Transform delivery dates from bigint[] to [{ deliveryDate: number }]
  // Filter out dates that are earlier than now
  const deliveryDates = useMemo(() => {
    if (!deliveryDatesRaw) return [];
    const now = Math.floor(Date.now() / 1000); // Current time in Unix timestamp (seconds)
    return deliveryDatesRaw
      .map((date) => ({
        deliveryDate: Number(date),
      }))
      .filter(({ deliveryDate }) => deliveryDate >= now)
      .sort((a, b) => a.deliveryDate - b.deliveryDate); // Sort by date ascending
  }, [deliveryDatesRaw]);

  // Reset selected date index if it's out of bounds after filtering
  useEffect(() => {
    if (deliveryDates.length > 0 && selectedDateIndex >= deliveryDates.length) {
      setSelectedDateIndex(0);
    }
  }, [deliveryDates.length, selectedDateIndex]);

  // Get selected delivery date
  const selectedDeliveryDate = deliveryDates[selectedDateIndex]?.deliveryDate;

  // Notify parent component when delivery date changes
  useEffect(() => {
    if (selectedDeliveryDate) {
      onDeliveryDateChange?.(selectedDeliveryDate);
    } else {
      onDeliveryDateChange?.(undefined);
    }
  }, [selectedDeliveryDate]);

  // Fetch order book for selected delivery date
  const orderBookQuery = useAggregateOrderBook(selectedDeliveryDate, { refetch: true, interval: 15000 });
  const orderBookData = orderBookQuery.data?.data?.orders || [];

  useEffect(() => {
    previousOrderBookStateRef.current = new Map();
    orderBookQuery.refetch();
  }, [selectedDateIndex]);

  // Helper function to normalize price
  const normalizePrice = (price: number, minimumPriceIncrement: number | null): number => {
    if (minimumPriceIncrement !== null) {
      return Math.round(price / minimumPriceIncrement) * minimumPriceIncrement;
    }
    return Math.round(price * 100) / 100;
  };

  // Get current order book state from pre-aggregated data
  const currentOrderBookState = useMemo(() => {
    const state = new Map<number, { bidUnits: number; askUnits: number }>();
    const minimumPriceIncrement = contractSpecsQuery.data?.data?.minimumPriceIncrement
      ? Number(contractSpecsQuery.data.data.minimumPriceIncrement) / 1e6
      : null;

    if (!orderBookData || orderBookData.length <= 0) {
      return state;
    }

    // Data is already aggregated with buyOrdersCount and sellOrdersCount
    for (const order of orderBookData) {
      const rawPrice = Number(order.price) / 1e6;
      const price = normalizePrice(rawPrice, minimumPriceIncrement);
      state.set(price, {
        bidUnits: order.buyOrdersCount,
        askUnits: order.sellOrdersCount,
      });
    }

    return state;
  }, [orderBookData]);

  // Create final order book data
  const finalOrderBookData = createFinalOrderBookData(orderBookData, marketPrice, contractSpecsQuery.data?.data);

  // Add highlighting to final order book data based on price changes
  const finalOrderBookDataWithHighlights = useMemo(() => {
    return finalOrderBookData.map((row) => {
      const highlight = priceHighlights.get(row.price);
      return {
        ...row,
        highlightBid: highlight?.highlightBid ?? false,
        highlightAsk: highlight?.highlightAsk ?? false,
      };
    });
  }, [finalOrderBookData, priceHighlights]);

  // Calculate max bid and ask amounts for fill width calculation
  const { maxBidAmount, maxAskAmount } = useMemo(() => {
    let maxBid = 0;
    let maxAsk = 0;
    for (const row of finalOrderBookDataWithHighlights) {
      if (row.bidUnits && row.bidUnits > maxBid) {
        maxBid = row.bidUnits;
      }
      if (row.askUnits && row.askUnits > maxAsk) {
        maxAsk = row.askUnits;
      }
    }
    return { maxBidAmount: maxBid, maxAskAmount: maxAsk };
  }, [finalOrderBookDataWithHighlights]);

  const currentBasePrice = finalOrderBookDataWithHighlights.find((o) => o.isLastHashprice);

  // Auto-scroll to last hashprice row when basePrice (hashprice) updates
  useEffect(() => {
    if (!tableContainerRef.current) {
      return;
    }
    if (!finalOrderBookData.length || !currentBasePrice) {
      return;
    }
    if (previousBasePriceRef.current) {
      return;
    }

    previousBasePriceRef.current = currentBasePrice.price;

    setTimeout(() => {
      // Find the last hashprice row index
      const lastHashpriceIndex = finalOrderBookDataWithHighlights.findIndex((row) => row.isLastHashprice);
      scrollToOrder(lastHashpriceIndex);
    }, 100);
  }, [currentBasePrice, finalOrderBookDataWithHighlights]);

  // Track order book changes and highlight changed prices
  useEffect(() => {
    const previousState = previousOrderBookStateRef.current;

    if (!orderBookData.length || !previousState.size) {
      // First load or no previous state - just store current state
      previousOrderBookStateRef.current = new Map(currentOrderBookState);
      return;
    }

    const newHighlights = new Map<number, { highlightBid: boolean; highlightAsk: boolean }>();

    // Check all prices in current state
    for (const [price, current] of currentOrderBookState.entries()) {
      const previous = previousState.get(price);

      if (previous && previous.askUnits == current.askUnits && previous.bidUnits == current.bidUnits) {
        continue;
      }

      const highlightBid = !previous ? current.bidUnits > 0 : current.bidUnits > (previous.bidUnits ?? 0);

      const highlightAsk = !previous ? current.askUnits > 0 : current.askUnits > (previous.askUnits ?? 0);

      if (highlightBid || highlightAsk) {
        newHighlights.set(price, { highlightBid, highlightAsk });
      }
    }

    // Update highlights if there are any changes
    if (newHighlights.size > 0) {
      setPriceHighlights(newHighlights);

      const firstItemToHightlight = finalOrderBookDataWithHighlights.findIndex(
        (row) => row.price == newHighlights.keys().next().value,
      );
      scrollToOrder(firstItemToHightlight);

      // Clear highlights after 2 seconds
      setTimeout(() => {
        setPriceHighlights(new Map());
      }, 3000);
    }

    previousOrderBookStateRef.current = new Map(currentOrderBookState);
  }, [orderBookData, currentOrderBookState]);

  // Navigation functions
  const goToPreviousDate = () => {
    if (selectedDateIndex > 0) {
      setSelectedDateIndex(selectedDateIndex - 1);
    }
  };

  const goToNextDate = () => {
    if (selectedDateIndex < deliveryDates.length - 1) {
      setSelectedDateIndex(selectedDateIndex + 1);
    }
  };

  const scrollToOrder = (orderIndex: number) => {
    setTimeout(() => {
      if (orderIndex !== -1 && tableContainerRef.current) {
        const rowHeight = 51.4; // Fixed row height from styles

        // Calculate scroll position to center the row in the viewport
        // (row index * row height) - (container height / 2) + (row height / 2)
        const scrollPosition = orderIndex * rowHeight - 5 * rowHeight;

        // Smooth scroll to center the row
        tableContainerRef.current.scrollTo({
          top: Math.max(0, scrollPosition),
          behavior: "smooth",
        });
      }
    }, 100);
  };

  // Format delivery date for display
  const formatDeliveryDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const selectedDateDisplay = selectedDeliveryDate
    ? formatDeliveryDate(selectedDeliveryDate)
    : isLoading
      ? "Loading..."
      : "No dates available";

  // Show error state
  if (isError) {
    return (
      <OrderBookWidget>
        <Header>
          <button className="nav-arrow" disabled>
            ←
          </button>
          <h3>Error</h3>
          <button className="nav-arrow" disabled>
            →
          </button>
        </Header>
        <TableContainer>
          <div style={{ textAlign: "center", padding: "2rem", color: "#ef4444" }}>Failed to load order book data</div>
        </TableContainer>
      </OrderBookWidget>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <OrderBookWidget>
        <Header>
          <button className="nav-arrow" disabled>
            ←
          </button>
          <h3>Loading...</h3>
          <button className="nav-arrow" disabled>
            →
          </button>
        </Header>
        <TableContainer>
          <div style={{ textAlign: "center", padding: "2rem", color: "#a7a9b6" }}>Loading order book data...</div>
        </TableContainer>
      </OrderBookWidget>
    );
  }

  return (
    <OrderBookWidget>
      <h3>Order Book</h3>
      <Header>
        <button onClick={goToPreviousDate} className="nav-arrow" disabled={selectedDateIndex === 0 || isLoading}>
          ←
        </button>
        <h3>{selectedDateDisplay}</h3>
        <button
          onClick={goToNextDate}
          className="nav-arrow"
          disabled={selectedDateIndex === deliveryDates.length - 1 || isLoading}
        >
          →
        </button>
      </Header>

      <TableContainer ref={tableContainerRef}>
        <Table>
          <thead>
            <tr>
              <th>Bid</th>
              <th>Price</th>
              <th>Ask</th>
            </tr>
          </thead>
          <tbody>
            {finalOrderBookDataWithHighlights.map((row, index) => {
              // Calculate fill percentages for bid and ask
              const bidFillPercent = row.bidUnits && maxBidAmount > 0 ? (row.bidUnits / maxBidAmount) * 100 : 0;
              const askFillPercent = row.askUnits && maxAskAmount > 0 ? (row.askUnits / maxAskAmount) * 100 : 0;

              return (
                <TableRow
                  key={index}
                  $bidFillPercent={bidFillPercent}
                  $askFillPercent={askFillPercent}
                  onClick={() => {
                    // Use askUnits if available, otherwise bidUnits, otherwise null
                    const amount = row.askUnits || row.bidUnits || null;
                    onRowClick?.(row.price.toFixed(2), amount);
                  }}
                >
                  <BidCell $isHighlighted={row.highlightBid}>{row.bidUnits || ""}</BidCell>
                  <PriceCell $isLastHashprice={row.isLastHashprice}>{row.price.toFixed(2)}</PriceCell>
                  <AskCell $isHighlighted={row.highlightAsk}>{row.askUnits || ""}</AskCell>
                </TableRow>
              );
            })}
          </tbody>
        </Table>
      </TableContainer>
    </OrderBookWidget>
  );
};

const OrderBookWidget = styled(SmallWidget)`
  width: 100%;
  padding: 1.5rem;
  padding-top: 0.5rem;
  justify-content: space-between;

  @media (max-width: 1400px) {
    justify-content: start;
  }
`;

const Header = styled("div")`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  
  h3 {
    margin: 0;
    font-size: 1.3rem;
    font-weight: 600;
  }
  
  .nav-arrow {
    background: none;
    border: none;
    color: #fff;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0.5rem 0.75rem;
    border-radius: 4px;
    transition: all 0.2s ease;
    
    &:hover:not(:disabled) {
      background-color: rgba(255, 255, 255, 0.1);
    }
    
    &:disabled {
      color: #666;
      cursor: not-allowed;
      opacity: 0.5;
    }
  }
`;

const TableContainer = styled("div")`
  overflow-y: auto;
  width: 100%;
  max-height: 607px; /* Approximately 10 rows * 40px per row */
  
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
  
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.5);
  }
`;

const Table = styled("table")`
  width: 100%;
  border-collapse: collapse;
  
  th {
    text-align: center;
    padding: 1rem 0.75rem;
    font-size: 1rem;
    font-weight: 600;
    color: #a7a9b6;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    position: sticky;
    top: 0;
    background-color: #1a1a1a; /* Match the widget background */
    z-index: 1;
  }
  
  td {
    text-align: center;
    padding: 0.75rem 0.75rem;
    font-size: 1.1rem;
    color: #fff;
    width: 130px;
    height: 40px; /* Fixed row height for consistent scrolling */
  }
`;

const TableRow = styled("tr")<{
  $bidFillPercent?: number;
  $askFillPercent?: number;
}>`
  position: relative;
  cursor: pointer;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  
  /* Background fills for order book depth visualization */
  background: ${(props) => {
    const bidFill = props.$bidFillPercent || 0;
    const askFill = props.$askFillPercent || 0;

    // Both bid and ask fills - split gradient
    if (bidFill > 0 && askFill > 0) {
      // Bid fills from center-left to left, Ask fills from center-right to right
      // Using 33% as bid column width, 33% center, 33% ask column width
      const bidStart = 33 - bidFill * 0.33;
      const askEnd = 67 + askFill * 0.33;
      return `linear-gradient(
        to right,
        transparent 0%,
        transparent ${bidStart}%,
        rgba(34, 197, 94, 0.25) ${bidStart}%,
        rgba(34, 197, 94, 0.25) 33%,
        transparent 33%,
        transparent 67%,
        rgba(239, 68, 68, 0.25) 67%,
        rgba(239, 68, 68, 0.25) ${askEnd}%,
        transparent ${askEnd}%,
        transparent 100%
      )`;
    }

    // Only bid fill - green from right edge of bid column
    if (bidFill > 0) {
      const bidStart = 33 - bidFill * 0.33;
      return `linear-gradient(
        to right,
        transparent 0%,
        transparent ${bidStart}%,
        rgba(34, 197, 94, 0.25) ${bidStart}%,
        rgba(34, 197, 94, 0.25) 33%,
        transparent 33%,
        transparent 100%
      )`;
    }

    // Only ask fill - red from left edge of ask column
    if (askFill > 0) {
      const askEnd = 67 + askFill * 0.33;
      return `linear-gradient(
        to right,
        transparent 0%,
        transparent 67%,
        rgba(239, 68, 68, 0.25) 67%,
        rgba(239, 68, 68, 0.25) ${askEnd}%,
        transparent ${askEnd}%,
        transparent 100%
      )`;
    }

    return "transparent";
  }};
  
  &:hover {
    background: rgba(255, 255, 255, 0.1) !important;
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const BidCell = styled("td")<{ $isHighlighted?: boolean }>`
  border-right: 1px solid rgba(255, 255, 255, 0.05);
  background-color: ${(props) => (props.$isHighlighted ? "rgba(34, 197, 94, 0.3)" : "transparent")};
  ${(props) =>
    props.$isHighlighted &&
    `
    box-shadow: inset 0 0 8px rgba(34, 197, 94, 0.4);
  `}
`;

const AskCell = styled("td")<{ $isHighlighted?: boolean }>`
  border-left: 1px solid rgba(255, 255, 255, 0.05);
  background-color: ${(props) => (props.$isHighlighted ? "rgba(239, 68, 68, 0.3)" : "transparent")};
  ${(props) =>
    props.$isHighlighted &&
    `
    box-shadow: inset 0 0 8px rgba(239, 68, 68, 0.4);
  `}
`;

const PriceCell = styled("td")<{ $isLastHashprice?: boolean }>`
  background-color: ${(props) => (props.$isLastHashprice ? "rgba(59, 130, 246, 0.3)" : "transparent")};
  font-weight: ${(props) => (props.$isLastHashprice ? "700" : "normal")};
  border-radius: 4px;
  
  ${(props) =>
    props.$isLastHashprice &&
    `
    box-shadow: 0 0 8px rgba(59, 130, 246, 0.5);
    border: 1px solid rgba(59, 130, 246, 0.6);
  `}
`;
