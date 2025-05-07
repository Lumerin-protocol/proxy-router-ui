import EastIcon from "@mui/icons-material/East";
import { type FC, useState } from "react";
import { useNavigate } from "react-router";
import { useAccount, useDisconnect } from "wagmi";
import { ConnectWalletModal } from "../../components/Forms/ConnectWalletModal";
import { ModalItem } from "../../components/Modal";
import { useModal } from "../../hooks/useModal";
import Prototype from "../../images/landing-hero.png";
import { PathName } from "../../types/types";
import { ButtonsWrapper, ConnectBtn, HeroHeadline, HeroSubheadline, HeroWrapper, Steps } from "./Landing.styled";

export const Landing: FC = () => {
  const connectWalletModal = useModal();
  const navigate = useNavigate();
  const { address } = useAccount();
  const { disconnect } = useDisconnect();

  const instructions = [
    {
      step: 1,
      text: "Purchase Lumerin Tokens (LMR)",
    },
    {
      step: 2,
      text: "Sign up for a mining pool account",
    },
    {
      step: 3,
      text: "Connect your Web3 Wallet",
    },
    {
      step: 4,
      text: "Purchase hashrate and point it at your mining pool account",
    },
  ];

  return (
    <>
      <ModalItem open={connectWalletModal.isOpen} setOpen={connectWalletModal.setOpen}>
        <ConnectWalletModal
          onConnect={() => {
            connectWalletModal.close();
            navigate(PathName.Marketplace);
          }}
        />
      </ModalItem>
      <HeroWrapper>
        <div className="content-wrapper">
          <div className="hero">
            <div className="left">
              <HeroHeadline>
                Lumerin <br />
                Hashpower <br />
                Marketplace
              </HeroHeadline>
              <HeroSubheadline>Buy, sell, and own hashpower through your Web3 wallet</HeroSubheadline>
              <ButtonsWrapper>
                {address ? (
                  <ConnectBtn type="button" onClick={() => disconnect()}>
                    Disconnect Wallet
                  </ConnectBtn>
                ) : (
                  <ConnectBtn type="button" onClick={() => connectWalletModal.open()}>
                    Connect Wallet
                  </ConnectBtn>
                )}
                <ConnectBtn type="button" onClick={() => navigate(PathName.Marketplace)}>
                  Enter Marketplace
                </ConnectBtn>
              </ButtonsWrapper>
            </div>
            <div className="right">
              <img src={Prototype} alt="prototype screenshot" />
            </div>
          </div>
          <h3>Easiest way to start mining Bitcoin, without hardware</h3>
          <Steps>
            {instructions.map((item) => (
              <li key={item.step}>
                <div className="step">{item.step}</div>
                <p>{item.text}</p>
              </li>
            ))}
          </Steps>
          <a className="instructions-link" href={process.env.REACT_APP_GITBOOK_URL} target="_blank" rel="noreferrer">
            View Detailed Instuctions <EastIcon className="arrow-icon" />
          </a>
        </div>
      </HeroWrapper>
    </>
  );
};
