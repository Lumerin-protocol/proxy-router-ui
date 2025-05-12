import styled from "@emotion/styled";
import { ArrowDownIcon, ArrowUpIcon, ArrowsUpDownIcon } from "@heroicons/react/24/outline";
import { Skeleton, useMediaQuery } from "@mui/material";
import { useEffect, useState } from "react";
import type { EthereumGateway } from "../../gateway/ethereum";
import { useModal } from "../../hooks/useModal";
import PriceIcon from "../../images/icons/price-icon-white.png";
import SpeedIcon from "../../images/icons/speed-icon-white.png";
import TimeIcon from "../../images/icons/time-icon-white.png";
import { formatFeePrice, formatPaymentPrice, formatTHPS } from "../../lib/units";
import { AddressLength, type HashRentalContract, SortTypes } from "../../types/types";
import { getReadableDate, truncateAddress } from "../../utils/utils";
import { BuyForm } from "../Forms/BuyerForms/BuyForm";
import { PrimaryButton, SecondaryButton } from "../Forms/FormButtons/Buttons.styled";
import { ModalItem } from "../Modal";
import {
  AvailableContract,
  MobileAvailableContract,
  MobileTableHeader,
  SkeletonWrap,
  TableHeader,
} from "./AvailableContract.styled";

const HeaderItem = styled.div`
	display: flex;
	gap: 5px;
	flex-direction: row;
	justify-content: center;
	align-items: center;

	p,
	svg {
		:hover {
			cursor: pointer;
		}
	}
`;

const TradeButtonsGroup = styled.div`
	display: flex;
	justify-content: space-between;
	flex: 1;
	button {
		width: 100%;
	}
`;

export const AvailableContracts = (prop: {
  contracts: HashRentalContract[];
  loading: boolean;
  setSortType: (sortType: string) => void;
  sortType?: string;
  web3Gateway: EthereumGateway;
}) => {
  const { isOpen, setOpen } = useModal();
  const [buyContractId, setBuyContractId] = useState<string | null>(null);
  const [activeSort, setActiveSort] = useState<string>("");
  const [sortState, setSortState] = useState<number>(0);

  useEffect(() => {
    if (activeSort === "speed") {
      if (sortState === 0) {
        prop.setSortType("");
      } else if (sortState === 1) {
        prop.setSortType(SortTypes.SpeedFastToSlow);
      } else if (sortState === 2) {
        prop.setSortType(SortTypes.SpeedSlowToFast);
      }
    }
    if (activeSort === "length") {
      if (sortState === 0) {
        prop.setSortType("");
      } else if (sortState === 1) {
        prop.setSortType(SortTypes.DurationLongToShort);
      } else if (sortState === 2) {
        prop.setSortType(SortTypes.DurationShortToLong);
      }
    }
    if (activeSort === "price") {
      if (sortState === 0) {
        prop.setSortType("");
      } else if (sortState === 1) {
        prop.setSortType(SortTypes.PriceHighToLow);
      } else if (sortState === 2) {
        prop.setSortType(SortTypes.PriceLowToHigh);
      }
    }
  }, [sortState, activeSort, prop]);

  const onClickSort = (field: string) => {
    setActiveSort(field);
    if (activeSort === field) {
      setSortState((sortState + 1) % 3);
    } else {
      setSortState(1);
    }
  };

  const getSortFieldIcon = (field: string) => {
    if (!activeSort) {
      return <ArrowsUpDownIcon className="h-4 w-4" />;
    }

    if (activeSort === field) {
      if (sortState === 0) {
        return <ArrowsUpDownIcon className="h-4 w-4" />;
      } else if (sortState === 1) {
        return <ArrowUpIcon className="h-4 w-4" />;
      } else if (sortState === 2) {
        return <ArrowDownIcon className="h-4 w-4" />;
      }
    } else {
      return <ArrowsUpDownIcon className="h-4 w-4" />;
    }
  };

  const getTableHeader = () => {
    const Header = isMobile ? MobileTableHeader : TableHeader;
    return (
      <Header key={"header"}>
        {!isMobile && <p>Address</p>}
        <HeaderItem onClick={() => onClickSort("speed")}>
          <p>Speed</p>
          {getSortFieldIcon("speed")}
        </HeaderItem>
        <HeaderItem onClick={() => onClickSort("length")}>
          <p>Duration</p>
          {getSortFieldIcon("length")}
        </HeaderItem>
        <HeaderItem onClick={() => onClickSort("price")}>
          <p>Price</p>
          {getSortFieldIcon("price")}
        </HeaderItem>
        <HeaderItem>
          <p>Fee</p>
        </HeaderItem>
      </Header>
    );
  };

  function renderModal() {
    return (
      <ModalItem open={isOpen} setOpen={setOpen}>
        <BuyForm contractId={buyContractId!} web3Gateway={prop.web3Gateway} setOpen={setOpen} />
      </ModalItem>
    );
  }

  const isMobile = useMediaQuery("(max-width: 768px)");

  if (prop.loading) {
    return (
      <>
        {[...Array(10)].map((_, index) => (
          <SkeletonWrap key={index}>
            <Skeleton variant="rectangular" width={"100%"} height={100} />
          </SkeletonWrap>
        ))}
      </>
    );
  }

  if (prop.contracts.length === 0) {
    return <h2 className="text-white">No contracts available for purchase.</h2>;
  }

  // Mobile view
  if (isMobile) {
    return (
      <ul>
        {renderModal()}
        <MobileTableHeader key="header">
          <HeaderItem onClick={() => onClickSort("speed")}>
            <p>Speed</p>
            {getSortFieldIcon("speed")}
          </HeaderItem>
          <HeaderItem onClick={() => onClickSort("length")}>
            <p>Duration</p>
            {getSortFieldIcon("length")}
          </HeaderItem>
          <HeaderItem onClick={() => onClickSort("price")}>
            <p>Price</p>
            {getSortFieldIcon("price")}
          </HeaderItem>
          <HeaderItem>
            <p>Fee</p>
          </HeaderItem>
        </MobileTableHeader>
        {prop.contracts.map((item, index) => (
          <MobileAvailableContract key={item.id as any}>
            <div className="stats">
              <div>
                <img src={SpeedIcon} alt="" />
                {formatSpeed(item.speed as string)}
              </div>
              {item.length && (
                <div>
                  <img src={TimeIcon} alt="" />
                  {formatDuration(item.length as string)}
                </div>
              )}
              <div>
                <img src={PriceIcon} alt="" />
                {formatPaymentPrice(item.price).full}
              </div>
            </div>
            <div className="actions">
              <TradeButtonsGroup>
                <SecondaryButton>
                  <a href={`${process.env.REACT_APP_ETHERSCAN_URL}${item.id}`} target="_blank" rel="noreferrer">
                    View Contract
                  </a>
                </SecondaryButton>

                <PrimaryButton
                  onClick={() => {
                    setBuyContractId(item.id as string);
                    setOpen(true);
                  }}
                >
                  Purchase
                </PrimaryButton>
              </TradeButtonsGroup>
            </div>
          </MobileAvailableContract>
        ))}
      </ul>
    );
  }

  // Desktop view
  return (
    <ul>
      {renderModal()}
      <TableHeader key="header">
        <HeaderItem>
          <p>Address</p>
        </HeaderItem>
        <HeaderItem onClick={() => onClickSort("speed")}>
          <p>Speed</p>
          {getSortFieldIcon("speed")}
        </HeaderItem>
        <HeaderItem onClick={() => onClickSort("length")}>
          <p>Duration</p>
          {getSortFieldIcon("length")}
        </HeaderItem>
        <HeaderItem onClick={() => onClickSort("price")}>
          <p>Price</p>
          {getSortFieldIcon("price")}
        </HeaderItem>
        <HeaderItem>
          <p>Fee</p>
        </HeaderItem>
      </TableHeader>
      {prop.contracts.map((item) => (
        <AvailableContract key={item.id as any}>
          <p>
            <a
              className="underline pb-0 font-Raleway cursor-pointer"
              href={process.env.REACT_APP_ETHERSCAN_URL + `${item.id}`}
              target="_blank"
              rel="noreferrer"
            >
              {formatAddress(item.id as string)}
            </a>
          </p>
          <p>
            <img src={SpeedIcon} alt="" />
            {formatSpeed(item.speed as string)}
          </p>
          {item.length && (
            <p>
              <img src={TimeIcon} alt="" />
              {formatDuration(item.length as string)}
            </p>
          )}
          <p>
            <img src={PriceIcon} alt="" />
            {formatPaymentPrice(item.price).full}
          </p>
          <p>
            <img src={PriceIcon} alt="" />
            {formatFeePrice(item.fee).full}
          </p>
          <PrimaryButton
            onClick={() => {
              setBuyContractId(item.id as string);
              setOpen(true);
            }}
          >
            Purchase
          </PrimaryButton>
        </AvailableContract>
      ))}
    </ul>
  );
};

function formatSpeed(speedHps: string) {
  if (speedHps === undefined || speedHps === null) {
    return "…";
  }
  return formatTHPS(speedHps).full;
}

function formatDuration(length: string) {
  return getReadableDate(String(Number(length) / 3600));
}

function formatAddress(address: string) {
  if (address === undefined || address === null) {
    return "…";
  }
  return truncateAddress(address, AddressLength.MEDIUM);
}
