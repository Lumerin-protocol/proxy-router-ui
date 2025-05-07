import { AddressLength } from "../../types/types";
import { getReadableDate, truncateAddress } from "../../utils/utils";
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
import { DateTime } from "luxon";
import { useState } from "react";
import { EditForm as BuyerEditForm } from "../../components/Forms/BuyerForms/EditForm";
import type { EthereumGateway } from "../../gateway/ethereum";
import { useModal } from "../../hooks/useModal";
import { formatFeePrice, formatPaymentPrice, formatTHPS } from "../../lib/units";
import { ButtonGroup } from "../ButtonGroup";
import { CancelForm } from "../Forms/BuyerForms/CancelForm";
import { CancelButton } from "../Forms/FormButtons/CancelButton";
import { EditButton } from "../Forms/FormButtons/EditButton";
import { ModalItem } from "../Modal";

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

const getIcon = (contract: any, isCompleted = false) => {
  const isGoodCloseout = contract.progressPercentage === 100;
  if (isCompleted) {
    if (isGoodCloseout) {
      return <DoneIcon sx={{ color: "white" }} />;
    }
    return <CancelIcon sx={{ color: "white" }} />;
  }
  return <img src={PickaxeAnimated} alt="" />;
};

export type Card = {
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
};

interface CardProps {
  card: Card;
  key?: string;
  editClickHandler?: (contractId: string) => void;
  cancelClickHandler?: (contractId: string) => void;
}

const Card = (props: CardProps) => {
  const { card: item, editClickHandler, cancelClickHandler } = props;

  const startDate = DateTime.fromSeconds(item.startTime).toFormat("MM/dd/yyyy");
  const endDate = DateTime.fromSeconds(item.endTime).toFormat("MM/dd/yyyy");
  const isCompleted = item.progressPercentage >= 100;

  return (
    <div className="card">
      <div className="progress">
        <div className="pickaxe">{getIcon(item, isCompleted)}</div>
        <div className="utils">
          <div className="percentage-and-actions">
            <h2>{item.progressPercentage.toFixed()}% complete</h2>
            {editClickHandler && cancelClickHandler && (
              <div className="status">
                <div>
                  <ButtonGroup
                    button1={
                      <EditButton
                        onEdit={() => {
                          editClickHandler(item.contractAddr);
                        }}
                      />
                    }
                    button2={
                      <CancelButton
                        onCancel={() => {
                          cancelClickHandler(item.contractAddr);
                        }}
                      />
                    }
                  />
                </div>
              </div>
            )}
          </div>
          <BorderLinearProgress variant="determinate" value={item.progressPercentage} />
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
            <a href={process.env.REACT_APP_ETHERSCAN_URL + `${item.contractAddr}`} target="_blank" rel="noreferrer">
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
              <p>{formatDuration(item.length)}</p>
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
      </div>
    </div>
  );
};

export const RunningContracts = (props: {
  contracts: Card[];
  sortType: string;
  web3Gateway: EthereumGateway;
}) => {
  const editModal = useModal();
  const cancelModal = useModal();
  const [contractId, setContractId] = useState<string | null>(null);

  const progressAscending = [...props.contracts].sort((a, b) => a.progressPercentage! - b.progressPercentage!);

  const purchasedContracts = props.sortType ? props.contracts : progressAscending;

  return (
    <ContractCards>
      <ModalItem open={editModal.isOpen} setOpen={editModal.setOpen}>
        <BuyerEditForm contractId={contractId!} web3Gateway={props.web3Gateway} closeForm={() => editModal.close()} />
      </ModalItem>
      <ModalItem open={cancelModal.isOpen} setOpen={cancelModal.setOpen}>
        <CancelForm contractId={contractId!} web3Gateway={props.web3Gateway} closeForm={() => cancelModal.close()} />
      </ModalItem>
      {purchasedContracts.map((item, index) => {
        return (
          <Card
            key={item.contractAddr}
            card={item}
            editClickHandler={() => {
              setContractId(item.contractAddr);
              editModal.open();
            }}
            cancelClickHandler={() => {
              setContractId(item.contractAddr);
              cancelModal.open();
            }}
          />
        );
      })}
    </ContractCards>
  );
};

export const FinishedContracts = (props: { contracts: Card[]; sortType: string }) => {
  const purchastTimeAscending = [...props.contracts].sort((a, b) => +b.startTime! - +a.startTime!);
  const purchasedContracts = props.sortType ? props.contracts : purchastTimeAscending;

  return (
    <ContractCards>
      {purchasedContracts.map((item) => {
        return <Card key={item.contractAddr} card={item} />;
      })}
    </ContractCards>
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
