import styled from "@mui/material/styles/styled";
import { SmallWidget } from "../../Cards/Cards.styled";

interface FeedItem {
  id: string;
  type: "trade" | "price" | "news";
  title: string;
  description: string;
  timestamp: string;
  value?: string;
  change?: string;
}

export const FeedWidget = () => {
  // Dummy feed data
  const feedData: FeedItem[] = [
    {
      id: "1",
      type: "trade",
      title: "Large Trade Executed",
      description: "500 TH/s futures contract sold at $4.85",
      timestamp: "2 min ago",
      value: "$4.85",
      change: "+2.3%",
    },
    {
      id: "2",
      type: "price",
      title: "Price Update",
      description: "Hashprice index reached new high",
      timestamp: "5 min ago",
      value: "$4.90",
      change: "+1.8%",
    },
    {
      id: "3",
      type: "news",
      title: "Market News",
      description: "Bitcoin mining difficulty adjustment announced",
      timestamp: "12 min ago",
    },
    {
      id: "4",
      type: "trade",
      title: "Contract Expired",
      description: "200 TH/s contract completed successfully",
      timestamp: "18 min ago",
      value: "$4.75",
    },
    {
      id: "5",
      type: "price",
      title: "Price Alert",
      description: "Hashprice dropped below support level",
      timestamp: "25 min ago",
      value: "$4.60",
      change: "-1.2%",
    },
    {
      id: "6",
      type: "trade",
      title: "New Order Book Entry",
      description: "300 TH/s bid placed at $4.70",
      timestamp: "32 min ago",
      value: "$4.70",
    },
    {
      id: "7",
      type: "news",
      title: "Protocol Update",
      description: "New futures trading features released",
      timestamp: "45 min ago",
    },
    {
      id: "8",
      type: "trade",
      title: "Position Closed",
      description: "User closed long position with profit",
      timestamp: "1 hour ago",
      value: "+$1,250",
    },
  ];

  const getItemIcon = (type: string) => {
    switch (type) {
      case "trade":
        return "📈";
      case "price":
        return "💰";
      case "news":
        return "📰";
      default:
        return "📊";
    }
  };

  const getItemColor = (type: string) => {
    switch (type) {
      case "trade":
        return "#22c55e";
      case "price":
        return "#3b82f6";
      case "news":
        return "#f59e0b";
      default:
        return "#6b7280";
    }
  };

  return (
    <FeedWidgetContainer>
      <FeedHeader>
        <h3>Feed</h3>
        <div className="status-indicator">
          <div className="status-dot"></div>
          <span>Live</span>
        </div>
      </FeedHeader>

      <FeedContent>
        {feedData.map((item) => (
          <FeedItem key={item.id} $type={item.type}>
            <div className="item-icon" style={{ color: getItemColor(item.type) }}>
              {getItemIcon(item.type)}
            </div>
            <div className="item-content">
              <div className="item-header">
                <h4>{item.title}</h4>
                <span className="timestamp">{item.timestamp}</span>
              </div>
              <p className="description">{item.description}</p>
              {(item.value || item.change) && (
                <div className="item-values">
                  {item.value && <span className="value">{item.value}</span>}
                  {item.change && (
                    <span className={`change ${item.change.startsWith("+") ? "positive" : "negative"}`}>
                      {item.change}
                    </span>
                  )}
                </div>
              )}
            </div>
          </FeedItem>
        ))}
      </FeedContent>
    </FeedWidgetContainer>
  );
};

const FeedWidgetContainer = styled(SmallWidget)`
  height: calc(100vh - 200px);
  min-height: 500px;
  max-height: 800px;
  width: 300px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 2rem;
`;

const FeedHeader = styled("div")`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  h3 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
  }
  
  .status-indicator {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.75rem;
    color: #22c55e;
    
    .status-dot {
      width: 8px;
      height: 8px;
      background-color: #22c55e;
      border-radius: 50%;
      animation: pulse 2s infinite;
    }
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;

const FeedContent = styled("div")`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 2px;
  }
`;

const FeedItem = styled("div")<{ $type: string }>`
  display: flex;
  gap: 0.75rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
  border-left: 3px solid ${(props) => {
    switch (props.$type) {
      case "trade":
        return "#22c55e";
      case "price":
        return "#3b82f6";
      case "news":
        return "#f59e0b";
      default:
        return "#6b7280";
    }
  }};
  transition: background-color 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
  
  .item-icon {
    font-size: 1.2rem;
    flex-shrink: 0;
    margin-top: 0.125rem;
  }
  
  .item-content {
    flex: 1;
    min-width: 0;
  }
  
  .item-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 0.25rem;
    
    h4 {
      margin: 0;
      font-size: 0.875rem;
      font-weight: 600;
      color: #fff;
      line-height: 1.2;
    }
    
    .timestamp {
      font-size: 0.75rem;
      color: #6b7280;
      flex-shrink: 0;
      margin-left: 0.5rem;
    }
  }
  
  .description {
    margin: 0 0 0.5rem 0;
    font-size: 0.8rem;
    color: #a7a9b6;
    line-height: 1.3;
  }
  
  .item-values {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    
    .value {
      font-size: 0.8rem;
      font-weight: 600;
      color: #fff;
    }
    
    .change {
      font-size: 0.75rem;
      font-weight: 600;
      
      &.positive {
        color: #22c55e;
      }
      
      &.negative {
        color: #ef4444;
      }
    }
  }
`;
