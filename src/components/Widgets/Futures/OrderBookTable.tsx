import styled from "@mui/material/styles/styled";
import { SmallWidget } from "../../Cards/Cards.styled";
import { useState, useEffect } from "react";
import { useDeliveryDates } from "../../../hooks/data/useDeliveryDates";
import { useOrderBook, type OrderBookOrder } from "../../../hooks/data/useOrderBook";
import { useSimulatedBlockchainTime } from "../../../hooks/data/useSimulatedBlockchainTime";

interface OrderBookData {
  bidUnits: number | null;
  price: number;
  askUnits: number | null;
  isHighlighted?: boolean;
  highlightColor?: "red" | "green";
}

interface OrderBookTableProps {
  onRowClick?: (price: number, amount: number | null) => void;
  onDeliveryDateChange?: (deliveryDate: number | undefined) => void;
  orderBookData?: OrderBookData[];
}

// Transform order book data from API to component interface
const transformOrderBookData = (orders: OrderBookOrder[]): OrderBookData[] => {
  if (!orders || orders.length === 0) {
    return [];
  }

  // Group orders by price and separate buy/sell orders
  const priceGroups = new Map<number, { bids: OrderBookOrder[]; asks: OrderBookOrder[] }>();

  orders.forEach((order) => {
    // Convert BigInt price to number (price is already in wei, convert to USDC)
    const price = Number(order.price) / 1e6; // Convert from wei to USDC

    // Round to avoid floating point precision issues
    const roundedPrice = Math.round(price * 100) / 100;

    if (!priceGroups.has(roundedPrice)) {
      priceGroups.set(roundedPrice, { bids: [], asks: [] });
    }

    if (order.isBuy) {
      priceGroups.get(roundedPrice)!.bids.push(order);
    } else {
      priceGroups.get(roundedPrice)!.asks.push(order);
    }
  });

  // Convert to OrderBookData format
  const orderBookData: OrderBookData[] = [];

  // Sort prices in descending order for display
  const sortedPrices = Array.from(priceGroups.keys()).sort((a, b) => b - a);

  sortedPrices.forEach((price) => {
    const group = priceGroups.get(price)!;

    // Calculate total units for bids and asks
    const bidUnits = group.bids.length > 0 ? group.bids.length : null; // Simplified: using count instead of actual units
    const askUnits = group.asks.length > 0 ? group.asks.length : null; // Simplified: using count instead of actual units

    orderBookData.push({
      bidUnits,
      price,
      askUnits,
    });
  });

  return orderBookData;
};

export const OrderBookTable = ({
  onRowClick,
  onDeliveryDateChange,
  orderBookData: propOrderBookData,
}: OrderBookTableProps) => {
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);

  // // Get current blockchain time
  // const now = useSimulatedBlockchainTime();

  const { data: deliveryDatesResponse, isLoading, isError, isSuccess } = useDeliveryDates();

  // Fetch delivery dates
  const deliveryDates = deliveryDatesResponse?.data || [];

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

  // // Fetch order book for selected delivery date
  // const orderBookQuery = useOrderBook(selectedDeliveryDate, { refetch: true });
  // const orderBookData = orderBookQuery.data?.data?.orders || [];

  // // Transform order book data to match the expected interface
  // const transformedOrderBookData = transformOrderBookData(orderBookData);

  // // Use passed data or fallback to transformed data
  // const finalOrderBookData = propOrderBookData || transformedOrderBookData;

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

      <TableContainer>
        <Table>
          <thead>
            <tr>
              <th>Bid, units</th>
              <th>Price, USDC</th>
              <th>Ask, units</th>
            </tr>
          </thead>
          <tbody>
            {propOrderBookData?.map((row, index) => (
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
                <td>{row.price.toFixed(2)}</td>
                <td>{row.askUnits || ""}</td>
              </TableRow>
            ))}
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
    height: 40px; /* Fixed row height for consistent scrolling */
  }
`;

const TableRow = styled("tr")<{ $isHighlighted?: boolean; $highlightColor?: "red" | "green" }>`
  background-color: ${(props) => {
    if (!props.$isHighlighted) return "transparent";
    return props.$highlightColor === "red" ? "rgba(239, 68, 68, 0.2)" : "rgba(34, 197, 94, 0.2)";
  }};
  cursor: pointer;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;
