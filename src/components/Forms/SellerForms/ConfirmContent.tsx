import type { FC } from "react";
import { truncateAddress } from "../../../utils/utils";
import { ReviewItems } from "../Forms.styled";
import { AddressLength } from "../../../types/types";
import type { InputValuesCreateForm } from "../CreateForm";

interface ConfirmContentProps {
  data: InputValuesCreateForm;
}

interface GenericConfirmContentProps {
  data: Record<string, string | number | bigint>;
}

export const GenericConfirmContent: FC<GenericConfirmContentProps> = ({ data }) => {
  return (
    <ReviewItems>
      {Object.entries(data).map(([key, value]) => (
        <div key={key}>
          <h3>{key}</h3>
          <p>{typeof value === "bigint" ? value.toString() : value}</p>
        </div>
      ))}
    </ReviewItems>
  );
};

export const ConfirmContent: FC<ConfirmContentProps> = ({ data }) => {
  return (
    <ReviewItems>
      <div>
        <h3>Wallet Address</h3>
        <p>{truncateAddress(data.walletAddress, AddressLength.MEDIUM)}</p>
      </div>
      <div>
        <h3>Contract Duration</h3>
        <p>{data.durationHours} hours</p>
      </div>
      <div>
        <h3>Speed</h3>
        <p>{data.speedTHPS} TH/S</p>
      </div>
      <div>
        <h3>Profit Target</h3>
        <p>{data.profitTargetPercent}%</p>
      </div>
    </ReviewItems>
  );
};
