import { AddressLength, ContractState } from "../../types/types";
import { getProgressPercentage, truncateAddress } from "../../utils/utils";
import "react-circular-progressbar/dist/styles.css";
import CancelIcon from "@mui/icons-material/CancelOutlined";
import DoneIcon from "@mui/icons-material/Done";
import { Divider, LinearProgress, linearProgressClasses } from "@mui/material";
import PickaxeAnimated from "../../images/icons/pickaxe-animated.gif";
import PriceTag from "../../images/icons/price-icon-white.png";
import Speed from "../../images/icons/speed-icon-white.png";
import Time from "../../images/icons/time-icon-white.png";
import IDCard from "../../images/id-card-white.png";
import Pickaxe from "../../images/pickaxe-white.png";
import { ContractCards } from "./PurchasedContracts.styled";
import styled from "@emotion/styled";
import { FC, useState } from "react";
import type { EthereumGateway } from "../../gateway/ethereum";
import { useModal } from "../../hooks/useModal";
import { formatFeePrice, formatPaymentPrice, formatHashrateTHPS } from "../../lib/units";
import { ButtonGroup } from "../ButtonGroup";
import { ModalItem } from "../Modal";
import { getContractUrl } from "../../lib/indexer";
import { formatDate, formatDateTime } from "../../lib/date";
import { formatDuration } from "../../lib/duration";
import { CancelButton, EditButton } from "../Forms/FormButtons/ActionButton";
import { BuyerEditForm } from "../Forms/BuyerEditForm";
import { useSimulatedBlockchainTime } from "../../hooks/data/useSimulatedBlockchainTime";
import { CancelForm } from "../Forms/CancelForm";

const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 10,
  borderRadius: 5,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor: "#000",
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5,
    backgroundColor: "#fff",
  },
}));

const getIcon = (icon: "inprogress" | "completed" | "closed-early") => {
  if (icon === "inprogress") {
    return <img src={PickaxeAnimated} alt="" />;
  }
  if (icon === "completed") {
    return <DoneIcon sx={{ color: "white" }} />;
  }
  return <CancelIcon sx={{ color: "white" }} />;
};

export type CardData = {
  startTime: number;
  endTime: number;
  progressPercentage: number;
  contractAddr: string;
  speedHps: string;
  price: string;
  fee: string;
  length: string;
  poolAddress: string;
  poolUsername: string;
  validatorAddress: string;
};

interface CardProps {
  card: CardData;
  key?: string;
  editClickHandler?: (contractId: string) => void;
  cancelClickHandler?: (contractId: string) => void;
}

export const Card: FC<CardProps> = (props) => {
  const { card: item, editClickHandler, cancelClickHandler } = props;
  const now = new Date().getTime() / 1000;
  const startDate = formatDateTime(item.startTime);
  const endDate = formatDateTime(item.endTime);

  const progressPercentage = Math.round(((Math.min(item.endTime, now) - item.startTime) * 100) / Number(item.length));

  const isCompleted = now > Number(item.endTime);
  const isClosedEarly = item.endTime - item.startTime < Number(item.length);
  const icon = isClosedEarly ? "closed-early" : progressPercentage === 100 ? "completed" : "inprogress";

  return (
    <div className="card">
      <div className="progress">
        <div className="pickaxe">{getIcon(icon)}</div>
        <div className="utils">
          <div className="percentage-and-actions">
            <h2>{progressPercentage}% complete</h2>
            {editClickHandler && cancelClickHandler && (
              <div className="status">
                <div>
                  <ButtonGroup
                    button1={
                      <EditButton
                        onClick={() => {
                          editClickHandler(item.contractAddr);
                        }}
                      />
                    }
                    button2={
                      <CancelButton
                        onClick={() => {
                          cancelClickHandler(item.contractAddr);
                        }}
                      />
                    }
                  />
                </div>
              </div>
            )}
          </div>
          <BorderLinearProgress variant="determinate" value={progressPercentage} />
        </div>
      </div>
      <div className="grid">
        <div className="row">
          <div className="item-value started">
            <div>
              <h3>CONTRACT START</h3>
              <p>{startDate}</p>
            </div>
          </div>
          <div className="item-value started">
            <div>
              <h3>CONTRACT END</h3>
              <p>{endDate}</p>
            </div>
          </div>
        </div>
        <div className="item-value address">
          <div>
            <h3>CONTRACT ADDRESS</h3>
            <a href={getContractUrl(item.contractAddr as `0x${string}`)} target="_blank" rel="noreferrer">
              {item.contractAddr ? truncateAddress(item.contractAddr, AddressLength.LONG) : "…"}
            </a>
          </div>
        </div>
        <div className="terms">
          <div className="item-value speed">
            <img src={Speed} alt="" />
            <div>
              <h3>SPEED</h3>
              <p>{formatSpeed(item.speedHps)}</p>
            </div>
          </div>
          <div className="item-value price">
            <img src={PriceTag} alt="" />
            <div>
              <h3>PRICE</h3>
              <p>{formatPaymentPrice(item.price).full}</p>
            </div>
          </div>
          <div className="item-value price">
            <img src={PriceTag} alt="" />
            <div>
              <h3>FEE</h3>
              <p>{formatFeePrice(item.fee).full}</p>
            </div>
          </div>
          <div className="item-value duration">
            <img src={Time} alt="" />
            <div>
              <h3>DURATION</h3>
              <p>{formatDuration(BigInt(item.length))}</p>
            </div>
          </div>
        </div>
        {!isCompleted && (
          <>
            <Divider variant="middle" sx={{ my: 2 }} />
            <h3 className="sm-header">POOL CONNECTION</h3>
            <div className="item-value username">
              <img src={IDCard} alt="" />
              <div>
                <p>{item.poolAddress} </p>
              </div>
            </div>
            <div className="item-value address">
              <img src={Pickaxe} alt="" />
              <div>
                <p>{item.poolUsername}</p>
              </div>
            </div>
          </>
        )}
        <Divider variant="middle" sx={{ my: 2 }} />
        <h3 className="sm-header">VALIDATOR</h3>
        <div className="item-value username">
          <img src={IDCard} alt="" />
          <div>
            <p>{truncateAddress(item.validatorAddress, AddressLength.LONG)} </p>
          </div>
        </div>
      </div>
    </div>
  );
};

function formatSpeed(speedHps: string) {
  if (speedHps === undefined || speedHps === null) {
    return "…";
  }
  return formatHashrateTHPS(speedHps).full;
}
