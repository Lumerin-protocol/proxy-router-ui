import styled from "@mui/material/styles/styled";
import { SmallWidget } from "../../Cards/Cards.styled";
import { useState, useEffect, useRef, useMemo } from "react";
import { useGetDeliveryDates } from "../../../hooks/data/useGetDeliveryDates";
import { useOrderBook } from "../../../hooks/data/useOrderBook";
import { useHashrateIndexData } from "../../../hooks/data/useHashRateIndexData";
import { createFinalOrderBookData } from "./orderBookHelpers";
import type { UseQueryResult } from "@tanstack/react-query";
import type { GetResponse } from "../../../gateway/interfaces";
import type { FuturesContractSpecs } from "../../../hooks/data/useFuturesContractSpecs";

interface OrderBookTableProps {
  onRowClick?: (price: number, amount: number | null) => void;
  onDeliveryDateChange?: (deliveryDate: number | undefined) => void;
  contractSpecsQuery: UseQueryResult<GetResponse<FuturesContractSpecs>, Error>;
}

export const OrderBookTable = ({ onRowClick, onDeliveryDateChange, contractSpecsQuery }: OrderBookTableProps) => {
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const { data: deliveryDatesRaw, isLoading, isError } = useGetDeliveryDates();
  const hashrateQuery = useHashrateIndexData();

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
  }, [selectedDeliveryDate, onDeliveryDateChange]);

  // Fetch order book for selected delivery date
  const orderBookQuery = useOrderBook(selectedDeliveryDate, { refetch: true });
  const orderBookData = orderBookQuery.data?.data?.orders || [];

  // Create final order book data
  const finalOrderBookData = createFinalOrderBookData(
    orderBookData,
    hashrateQuery.data as any,
    contractSpecsQuery.data?.data,
  );

  // Calculate current basePrice (last hashprice) from hashrate data
  const currentBasePrice = useMemo(() => {
    const hashrateData = hashrateQuery.data;
    const minimumPriceIncrement = contractSpecsQuery.data?.data?.minimumPriceIncrement;

    if (hashrateData && hashrateData.length > 0 && minimumPriceIncrement) {
      // Get the newest item (first item in the array since it's ordered by updatedAt desc)
      const newestItem = hashrateData[0];
      if (newestItem && newestItem.priceToken) {
        const rawPrice = Number(newestItem.priceToken) / 1e6; // Convert from wei to USDC
        const minIncrement = Number(minimumPriceIncrement) / 1e6; // Convert from wei to USDC
        // Round to the nearest multiple of minimumPriceIncrement
        return Math.round(rawPrice / minIncrement) * minIncrement;
      }
    }
    return null;
  }, [hashrateQuery.data, contractSpecsQuery.data?.data?.minimumPriceIncrement]);

  // Track previous basePrice to detect changes
  const previousBasePriceRef = useRef<number | null>(null);

  // Auto-scroll to last hashprice row when basePrice (hashprice) updates
  useEffect(() => {
    if (
      finalOrderBookData.length > 0 &&
      !isLoading &&
      tableContainerRef.current &&
      currentBasePrice !== null &&
      previousBasePriceRef.current !== null && // Only scroll if we had a previous value (not on initial mount)
      currentBasePrice !== previousBasePriceRef.current
    ) {
      // Update the ref to track the new value
      previousBasePriceRef.current = currentBasePrice;

      // Use setTimeout to ensure DOM is updated and refs are set
      const timeoutId = setTimeout(() => {
        // Find the last hashprice row index
        const lastHashpriceIndex = finalOrderBookData.findIndex((row) => row.isLastHashprice);

        if (lastHashpriceIndex !== -1 && tableContainerRef.current) {
          const rowHeight = 51.4; // Fixed row height from styles
          const containerHeight = tableContainerRef.current.clientHeight;

          // Calculate scroll position to center the row in the viewport
          // (row index * row height) - (container height / 2) + (row height / 2)
          const scrollPosition = lastHashpriceIndex * rowHeight - 5 * rowHeight;

          // Smooth scroll to center the row
          tableContainerRef.current.scrollTo({
            top: Math.max(0, scrollPosition),
            behavior: "smooth",
          });
        }
      }, 100); // Small delay to ensure DOM is updated

      return () => clearTimeout(timeoutId);
    } else if (currentBasePrice !== null && previousBasePriceRef.current === null) {
      // Initialize the ref on first load (don't scroll on initial mount)
      previousBasePriceRef.current = currentBasePrice;
    }
  }, [currentBasePrice, finalOrderBookData, isLoading]);

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
              <th>Buy</th>
              <th>Price, USDC</th>
              <th>Sell</th>
            </tr>
          </thead>
          <tbody>
            {finalOrderBookData.map((row, index) => {
              return (
                <TableRow
                  key={index}
                  $isHighlighted={row.isHighlighted}
                  $highlightColor={row.highlightColor}
                  onClick={() => {
                    // Use askUnits if available, otherwise bidUnits, otherwise null
                    const amount = row.askUnits || row.bidUnits || null;
                    onRowClick?.(row.price, amount);
                  }}
                >
                  <td>{row.bidUnits || ""}</td>
                  <PriceCell $isLastHashprice={row.isLastHashprice}>{row.price.toFixed(2)}</PriceCell>
                  <td>{row.askUnits || ""}</td>
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

const TableRow = styled("tr")<{ $isHighlighted?: boolean; $highlightColor?: "red" | "green" }>`
  background-color: ${(props) => {
    if (!props.$isHighlighted) return "transparent";
    return props.$highlightColor === "red" ? "rgba(239, 68, 68, 0.2)" : "rgba(34, 197, 94, 0.2)";
  }};
  cursor: pointer;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
  
  &:last-child {
    border-bottom: none;
  }
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
