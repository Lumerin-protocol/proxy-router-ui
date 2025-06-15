import { useAccount } from "wagmi";
import styled from "@mui/material/styles/styled";
import { AddressLength } from "../../types/types";
import { PrimaryButton } from "../Forms/FormButtons/Buttons.styled";
import { useAppKit } from "@reown/appkit/react";
import { ChainIcon } from "../../config/chains";
import { useEffect, useRef } from "react";
import { truncateAddress } from "../../utils/formatters";

type Props = {
  onConnect?: () => void;
  addressLength?: AddressLength;
  hideChain?: boolean;
  hideConnector?: boolean;
};

export const AccountButton = (props: Props) => {
  const { onConnect, addressLength = AddressLength.MEDIUM } = props;
  const { address, isConnected } = useAccount();
  const { open } = useAppKit();

  const shouldRedirect = useRef(false);

  useEffect(() => {
    if (isConnected && shouldRedirect.current) {
      onConnect?.();
    }
  }, [isConnected, onConnect]);

  if (address) {
    return (
      <Button type="button" onClick={() => open({ view: "Account" })}>
        {/* <Avatar
        size="24px"
        name={address}
        variant="marble"
        colors={["#1876D1", "#9A5AF7", "#CF9893", "#849483", "#4E937A"]}
        style={{ marginRight: "0.5rem" }}
      /> */}
        <WuiAvatar address={address} />
        {truncateAddress(address, addressLength)}
      </Button>
    );
  }
  return (
    <Button
      type="button"
      onClick={() => {
        open({ view: "Connect" });
        shouldRedirect.current = true;
      }}
    >
      Connect wallet
    </Button>
  );
};

export const ChainButton = (props?: { hideName?: boolean }) => {
  const { chain } = useAccount();
  const { open } = useAppKit();

  return (
    ChainIcon && (
      <Button type="button" onClick={() => open({ view: "Networks" })}>
        <ChainIcon width="1.5rem" height="1.5rem" />
        {!props?.hideName && chain?.name}
      </Button>
    )
  );
};

export const ConnectorButton = () => {
  const { connector } = useAccount();
  const { open } = useAppKit();

  return (
    connector?.icon && (
      <Button type="button" onClick={() => open({ view: "Connect" })}>
        <ConnectorIcon src={connector?.icon} alt="connector icon" />
      </Button>
    )
  );
};

// The same avatar component as the one in the appkit
const WuiAvatar = (props: { address: string }) => {
  const { address } = props;
  // @ts-ignore
  return <wui-avatar alt={address} address={address} size="sm" />;
};

const ConnectorIcon = styled("img")`
  width: 1.5rem;
  height: 1.5rem;
`;

export const Button = styled(PrimaryButton)`
  height: 48px;
  border-radius: 10px;
  color: #fff;
  font-weight: 600;
  font-size: 16px;
  background: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  gap: 0.5rem;
  border: rgba(171, 171, 171, 0.5) 1px solid;
  &:not(:last-child) {
    margin-right: 0;
  }
`;
