import styled from "@mui/material/styles/styled";
import { SmallWidget } from "../../Cards/Cards.styled";
import { useState } from "react";

interface OrderBookData {
  bidUnits: number | null;
  price: number;
  askUnits: number | null;
  isHighlighted?: boolean;
  highlightColor?: "red" | "green";
}

export const OrderBookTable = () => {
  const [selectedMonth, setSelectedMonth] = useState("September");

  // Dummy data based on the screenshot
  const orderBookData: OrderBookData[] = [
    { bidUnits: null, price: 5.15, askUnits: 7 },
    { bidUnits: null, price: 5.1, askUnits: 4 },
    { bidUnits: 1, price: 5.0, askUnits: 3, isHighlighted: true, highlightColor: "red" },
    { bidUnits: null, price: 4.95, askUnits: null },
    { bidUnits: null, price: 4.9, askUnits: null },
    { bidUnits: null, price: 4.85, askUnits: null },
    { bidUnits: null, price: 4.8, askUnits: null },
    { bidUnits: null, price: 4.75, askUnits: null },
    { bidUnits: 2, price: 4.7, askUnits: null, isHighlighted: true, highlightColor: "green" },
    { bidUnits: 3, price: 4.65, askUnits: null },
    { bidUnits: 5, price: 4.6, askUnits: null },
  ];

  return (
    <OrderBookWidget>
      <Header>
        <button onClick={() => setSelectedMonth("August")} className="nav-arrow">
          ←
        </button>
        <h3>{selectedMonth}</h3>
        <button onClick={() => setSelectedMonth("October")} className="nav-arrow">
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
            {orderBookData.map((row, index) => (
              <TableRow key={index} $isHighlighted={row.isHighlighted} $highlightColor={row.highlightColor}>
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
  padding: 1rem;
`;

const Header = styled("div")`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  
  h3 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
  }
  
  .nav-arrow {
    background: none;
    border: none;
    color: #fff;
    font-size: 1.2rem;
    cursor: pointer;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    
    &:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
  }
`;

const TableContainer = styled("div")`
  overflow-y: auto;
  
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

const Table = styled("table")`
  width: 100%;
  border-collapse: collapse;
  
  th {
    text-align: center;
    padding: 0.5rem 0.25rem;
    font-size: 0.75rem;
    font-weight: 600;
    color: #a7a9b6;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  td {
    text-align: center;
    padding: 0.4rem 0.25rem;
    font-size: 0.85rem;
    color: #fff;
  }
`;

const TableRow = styled("tr")<{ $isHighlighted?: boolean; $highlightColor?: "red" | "green" }>`
  background-color: ${(props) => {
    if (!props.$isHighlighted) return "transparent";
    return props.$highlightColor === "red" ? "rgba(239, 68, 68, 0.2)" : "rgba(34, 197, 94, 0.2)";
  }};
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }
`;
