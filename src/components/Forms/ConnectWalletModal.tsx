import styled from "@emotion/styled";
import type { FC } from "react";
import { type Config, Connector, useConnect } from "wagmi";
import type { ConnectData } from "wagmi/query";
import { ConnectButtonsWrapper } from "./FormButtons/Buttons.styled";

type Props = {
  onConnect: (connector: ConnectData<Config>) => void;
};

export const ConnectWalletModal: FC<Props> = (props) => {
  const { connectors, connect } = useConnect();

  return (
    <>
      <Header>Connect a wallet</Header>
      <ConnectButtonsWrapper>
        {connectors.map((connector) => (
          <button
            type="button"
            key={connector.uid}
            onClick={() =>
              connect(
                { connector },
                {
                  onSuccess: (data) => {
                    props.onConnect(data);
                  },
                  onError: (error) => {
                    console.log("onError", error);
                  },
                },
              )
            }
          >
            <span>{connector.name}</span>
            {connector.icon}
          </button>
        ))}
      </ConnectButtonsWrapper>
    </>
  );
};

const Header = styled.h2`
	font-size: 1.75rem;
	font-weight: 600;
	margin-bottom: 1rem;
`;
