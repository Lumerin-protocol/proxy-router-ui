import { AccountButton } from "./ConnectWidget";
import type { AddressLength } from "../../types/types";

type Props = {
  onConnect?: () => void;
  addressLength?: AddressLength;
  hideChain?: boolean;
  hideConnector?: boolean;
};

export const ConnectWidget = (props: Props) => {
  return <AccountButton onConnect={props.onConnect} />;
};
