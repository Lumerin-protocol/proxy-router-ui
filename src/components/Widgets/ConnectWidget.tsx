import { useAccount } from "wagmi";
import styled from "@emotion/styled";
import { AddressLength } from "../../types/types";
import { truncateAddress } from "../../utils/utils";
import { PrimaryButton } from "../Forms/FormButtons/Buttons.styled";
import { useAppKit } from "@reown/appkit/react";
import { arbitrum, arbitrumSepolia, hardhat } from "viem/chains";
import { ArbitrumLogo, ArbitrumSepoliaLogo, HardhatLogo } from "../../images";
import { ChainIcon } from "../../config/chains";

export const ConnectWidget = () => {
  const { address, connector, chain } = useAccount();
  const { open } = useAppKit();

  return (
    <ButtonGroup>
      {address ? (
        <>
          <Button type="button" onClick={() => open({ view: "Account" })}>
            {/* <Avatar
              size="24px"
              name={address}
              variant="marble"
              colors={["#1876D1", "#9A5AF7", "#CF9893", "#849483", "#4E937A"]}
              style={{ marginRight: "0.5rem" }}
            /> */}
            <WuiAvatar address={address} />
            {truncateAddress(address, AddressLength.MEDIUM)}
          </Button>
        </>
      ) : (
        <Button type="button" onClick={() => open({ view: "Connect" })}>
          Connect wallet
        </Button>
      )}
      {ChainIcon && (
        <Button type="button" onClick={() => open({ view: "Networks" })}>
          <ChainIcon width="1.5rem" height="1.5rem" />
          {chain?.name}
        </Button>
      )}
      {connector?.icon && (
        <Button type="button" onClick={() => open({ view: "Connect" })}>
          <ConnectorIcon src={connector?.icon} alt="connector icon" />
        </Button>
      )}
    </ButtonGroup>
  );
};

// The same avatar component as the one in the appkit
const WuiAvatar = (props: { address: string }) => {
  const { address } = props;
  return <wui-avatar alt={address} address={address} size="sm" />;
};

const ButtonGroup = styled("div")`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0rem;
`;

const ConnectorIcon = styled("img")`
  width: 1.5rem;
  height: 1.5rem;
`;

const Button = styled(PrimaryButton)`
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
`;
