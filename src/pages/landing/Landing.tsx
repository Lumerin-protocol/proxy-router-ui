import EastIcon from "@mui/icons-material/East";
import { Suspense, type FC } from "react";
import { useNavigate } from "react-router";
import Prototype from "../../images/landing-hero.png";
import { PathName } from "../../types/types";
import { ButtonsWrapper, ConnectBtn, HeroHeadline, HeroSubheadline, HeroWrapper, Steps } from "./Landing.styled";
import { safeLazy } from "../../utils/safeLazy";
import { Button as ConnectButton } from "../../components/Widgets/ConnectWidget";

const ConnectWidgetLazy = safeLazy(() =>
  import("../../components/Widgets/ConnectWidgetLazy").then((module) => ({
    default: module.ConnectWidget,
  })),
);

const Web3ProviderLazy = safeLazy(() =>
  import("../../Web3Provider").then((module) => ({
    default: module.Web3Provider,
  })),
);

export const Landing: FC = () => {
  const navigate = useNavigate();

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
              <Suspense fallback={<ConnectButton disabled>Connect wallet</ConnectButton>}>
                <Web3ProviderLazy>
                  <ConnectWidgetLazy
                    hideChain={true}
                    hideConnector={true}
                    onConnect={() => navigate(PathName.Marketplace)}
                  />
                </Web3ProviderLazy>
              </Suspense>
              <ButtonsWrapper>
                <ConnectBtn type="button" onClick={() => navigate(PathName.Marketplace)}>
                  Spot Market
                </ConnectBtn>
                <ConnectBtn type="button" onClick={() => navigate(PathName.Futures)}>
                  Futures Market
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
