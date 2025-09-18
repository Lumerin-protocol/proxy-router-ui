import { AddressLength } from "../../types/types";
import { truncateAddress } from "../../utils/formatters";
import "react-circular-progressbar/dist/styles.css";
import Divider from "@mui/material/Divider";
import PriceTag from "../../images/icons/price-icon-white.png";
import Speed from "../../images/icons/speed-icon-white.png";
import Time from "../../images/icons/time-icon-white.png";
import TypeIcon from "../../images/icons/seller-grey.png";
import type { FC } from "react";
import { formatFeePrice, formatPaymentPrice, formatHashrateTHPS } from "../../lib/units";
import { getContractUrl } from "../../lib/indexer";
import { formatDuration } from "../../lib/duration";
import { css } from "@emotion/react";
import { PurchaseDropdown } from "../PurchaseDropdown";
import LinearProgress from "@mui/material/LinearProgress";
import Tooltip from "@mui/material/Tooltip";
import { ArrowRightIcon, ArrowTrendingUpIcon, ArrowPathIcon, CurrencyDollarIcon } from "@heroicons/react/24/outline";

// The same avatar component as the one in the appkit
const WuiAvatar = (props: { address: string }) => {
  const { address } = props;
  // @ts-ignore
  return <wui-avatar alt={address} address={address} size="sm" />;
};

export type MarketplaceCardData = {
  id: string;
  speed: string;
  length: string;
  price: string;
  fee: string;
  seller: string;
  producer: string;
  type: "Direct" | "Resellable";
  stats: {
    successCount: string;
    failCount: string;
  };
};

type PurchaseType = "purchase" | "purchase-and-resell";

interface MarketplaceCardProps {
  card: MarketplaceCardData;
  userAccount?: `0x${string}`;
  onPurchase: (contractId: string, purchaseType: PurchaseType) => void;
}

const StatsProgressBar: FC<{ successCount: number; failCount: number }> = (props) => {
  const { successCount, failCount } = props;
  const total = successCount + failCount;
  const successPercentage = total === 0 ? 0 : (successCount / total) * 100;

  return (
    <div
      css={css`
        width: 100%;
        position: relative;
        :after {
          position: absolute;
          bottom: 100%;
          opacity: 0;
          visibility: hidden;
          width: max-content;
          transition: opacity 0.2s ease-in-out, visibility 0.2s ease-in-out;
          content: "Success: ${successCount} / Fail: ${failCount}";
          background-color: rgba(0, 0, 0, 0.5);
          color: #fff;
          font-size: 0.75rem;
          padding: 0.5rem;
          border-radius: 8px;
          transform: translateX(-25%);
          margin-bottom: 0.5rem;
        }
        :hover:after {
          opacity: 1;
          visibility: visible;
        }
      `}
    >
      <div
        css={css`
          position: relative;
          width: 60%;
        `}
      >
        <LinearProgress
          variant="determinate"
          value={successPercentage}
          sx={{
            height: 20,
            borderRadius: 10,
            backgroundColor: "rgba(42, 42, 42, 0.8)",
            "& .MuiLinearProgress-bar": {
              backgroundColor: "rgb(80, 158, 186)",
              borderRadius: 10,
            },
          }}
        />
        <div
          css={css`
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 0.75rem;
            font-weight: 600;
            color: #fff;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
            pointer-events: none;
          `}
        >
          {total}
        </div>
      </div>
    </div>
  );
};

const getTypeIcon = (type: "Direct" | "Resellable") => {
  if (type == "Direct") {
    return ArrowTrendingUpIcon;
  } else {
    return ArrowPathIcon;
  }
};

const getTypeDescription = (type: "Direct" | "Resellable") => {
  if (type === "Direct") {
    return "Direct Contract - Purchase directly from the original producer";
  } else {
    return "Resellable Contract - Can be purchased and resold to other buyers";
  }
};

export const MarketplaceCard: FC<MarketplaceCardProps> = (props) => {
  const { card: item, userAccount, onPurchase } = props;
  const TypeIcon = getTypeIcon(item.type);

  return (
    <div className="marketplace-card">
      <div className="card-header">
        <div className="contract-info">
          <h3>CONTRACT ADDRESS</h3>
          <a href={getContractUrl(item.id as `0x${string}`)} target="_blank" rel="noreferrer">
            {item.id ? truncateAddress(item.id, AddressLength.LONG) : "…"}
          </a>
        </div>
        <div className="stats-section">
          <div className="stats-icon">
            <Tooltip title={getTypeDescription(item.type)} arrow placement="top">
              <div className="list-icon">
                <TypeIcon className="w-8 h-8" />
              </div>
            </Tooltip>
          </div>
        </div>
      </div>

      <div className="terms">
        <div className="item-value speed">
          <img src={Speed} alt="" />
          <div>
            <h3>SPEED</h3>
            <p>{formatHashrateTHPS(item.speed).full}</p>
          </div>
        </div>
        <div className="item-value duration">
          <img src={Time} alt="" />
          <div>
            <h3>DURATION</h3>
            <p>{formatDuration(BigInt(item.length))}</p>
          </div>
        </div>
        {/* <div className="item-value type">
          <img src={TypeIcon} alt="" />
          <div>
            <h3>TYPE</h3>
            <p>{item.type}</p>
          </div>
        </div> */}
        <div className="item-value price">
          <img src={PriceTag} alt="" />
          <div>
            <h3>PRICE</h3>
            <p>{formatPaymentPrice(item.price).full}</p>
            <p className="fee-text">{formatFeePrice(item.fee).full}</p>
          </div>
        </div>
        {/* <div className="item-value fee">
          <img src={PriceTag} alt="" />
          <div>
            <h3>FEE</h3>
            <p>{formatFeePrice(item.fee).full}</p>
          </div>
        </div> */}
      </div>

      <Divider variant="fullWidth" sx={{ mt: 1, mb: 2 }} />

      <div className="stats-block">
        <h3>STATS</h3>
        <StatsProgressBar successCount={Number(item.stats.successCount)} failCount={Number(item.stats.failCount)} />
      </div>

      <Divider variant="fullWidth" sx={{ mt: 1, mb: 2 }} />

      <div className="seller-producer-info">
        <div className="item-value seller-producer">
          <div className="seller-section">
            <WuiAvatar address={item.seller} />
            <div>
              <h3>SELLER</h3>
              <p>{truncateAddress(item.seller, AddressLength.MEDIUM)}</p>
            </div>
          </div>
          <div className="producer-section">
            <WuiAvatar address={item.producer} />
            <div>
              <h3>PRODUCER</h3>
              <p>{truncateAddress(item.producer, AddressLength.MEDIUM)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card-actions">
        <PurchaseDropdown userAccount={userAccount} seller={item.seller} onPurchase={onPurchase} contractId={item.id} />
      </div>
    </div>
  );
};
