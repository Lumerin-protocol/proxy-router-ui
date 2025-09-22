import { AddressLength, type HashRentalContractV2 } from "../../types/types";
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

type PurchaseType = "purchase" | "purchase-and-resell";

interface MarketplaceCardProps {
  contract: HashRentalContractV2;
  userAccount?: `0x${string}`;
  onPurchase: (contract: HashRentalContractV2, purchaseType: PurchaseType) => void;
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

const calculatePricePerHour = (price: string, speed: string, duration: string) => {
  const priceValue = Number(price) / 10 ** 6;
  const speedValue = Number(speed) / 10 ** 12;
  const durationValue = duration;

  // Convert duration from seconds to hours (duration / 3600)
  const durationInHours = Number(durationValue) / 3600;

  // Calculate price per hour: (price * speed) / duration_in_hours
  const pricePerHour = (priceValue * speedValue) / Math.floor(durationInHours * 1000); // Multiply by 1000 for precision

  return pricePerHour.toFixed(4);
};

export const MarketplaceCard: FC<MarketplaceCardProps> = (props) => {
  const { contract, userAccount, onPurchase } = props;
  const TypeIcon = getTypeIcon(contract.isResellable ? "Resellable" : "Direct");

  return (
    <div className="marketplace-card">
      <div className="card-header">
        <div className="contract-info">
          <h3>CONTRACT ADDRESS</h3>
          <a href={getContractUrl(contract.id as `0x${string}`)} target="_blank" rel="noreferrer">
            {contract.id ? truncateAddress(contract.id, AddressLength.LONG) : "…"}
          </a>
        </div>
        <div className="stats-section">
          <div className="stats-icon">
            <Tooltip title={getTypeDescription(contract.isResellable ? "Resellable" : "Direct")} arrow placement="top">
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
            <p>{formatHashrateTHPS(contract.speed).full}</p>
          </div>
        </div>
        <div className="item-value duration">
          <img src={Time} alt="" />
          <div>
            <h3>DURATION</h3>
            <p>{formatDuration(BigInt(contract.length))}</p>
          </div>
        </div>
        <div className="item-value price">
          <img src={PriceTag} alt="" />
          <div>
            <h3>PRICE</h3>
            <div className="price-container">
              <div>
                <p>{formatPaymentPrice(contract.price).full}</p>
              </div>
              <div className="price-per-hour-text">
                {calculatePricePerHour(contract.price, contract.speed, contract.length)} USDC Th/s x hour
              </div>
            </div>
            <p className="fee-text">{formatFeePrice(contract.fee).full}</p>
          </div>
        </div>
      </div>

      <Divider variant="fullWidth" sx={{ mt: 1, mb: 2 }} />

      <div className="stats-block">
        <h3>STATS</h3>
        <StatsProgressBar
          successCount={Number(contract.stats.successCount)}
          failCount={Number(contract.stats.failCount)}
        />
      </div>

      <Divider variant="fullWidth" sx={{ mt: 1, mb: 2 }} />

      <div className="seller-producer-info">
        <div className="item-value seller-producer">
          <div className="seller-section">
            <WuiAvatar address={contract.seller} />
            <div>
              <h3>SELLER</h3>
              <p>{truncateAddress(contract.seller, AddressLength.MEDIUM)}</p>
            </div>
          </div>
          <div className="producer-section">
            <WuiAvatar address={contract.producer} />
            <div>
              <h3>PRODUCER</h3>
              <p>{truncateAddress(contract.producer, AddressLength.MEDIUM)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card-actions">
        <PurchaseDropdown
          userAccount={userAccount}
          seller={contract.seller}
          onPurchase={onPurchase}
          contract={contract}
        />
      </div>
    </div>
  );
};
