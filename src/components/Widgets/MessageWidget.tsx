import styled from "@mui/material/styles/styled";
import { Card, MobileWidget } from "../Cards/Cards.styled";
import { chain } from "../../config/chains";

export const MessageWidget = (props: { isMobile: boolean }) => {
  const MessageWrapper = styled(Card)`
    min-width: 250px;
    padding: 1rem;
    min-height: fit-content;
    width: 100%;
    background-color: rgba(79, 126, 145, 0.04);
    background: radial-gradient(circle, rgba(0, 0, 0, 0) 36%, rgba(255, 255, 255, 0.05) 100%);
    border: rgba(171, 171, 171, 1) 1px solid;
    p {
      font-size: 14px;
      color: #fff;
    }
    a {
      text-decoration: underline;
      color: #289ec1;
    }
  `;

  const MobileMessageWrapper = styled(MobileWidget)`
    width: 100%;
    padding: 18px;
    margin-bottom: 1rem;
    background-color: rgba(79, 126, 145, 0.04);
    background: radial-gradient(circle, rgba(0, 0, 0, 0) 36%, rgba(255, 255, 255, 0.05) 100%);
    border: rgba(171, 171, 171, 1) 1px solid;
    p {
      font-size: 14px;
      color: #fff;
    }
    a {
      text-decoration: underline;
      color: #289ec1;
    }
  `;

  const Content = () => {
    return (
      <p>
        Welcome to the Lumerin Marketplace on {chain.name}. Find detailed instructions in our{" "}
        <a href={`${process.env.REACT_APP_GITBOOK_URL}`} target="_blank" rel="noreferrer">
          Gitbook
        </a>
        {". "}
        Please provide feedback or submit any bugs to the{" "}
        <a href="https://github.com/Lumerin-protocol/proxy-router-ui/issues" target="_blank" rel="noreferrer">
          Github Repo
        </a>
        .
      </p>
    );
  };

  return (
    <>
      {props.isMobile ? (
        <MobileMessageWrapper>
          <Content />
        </MobileMessageWrapper>
      ) : (
        <MessageWrapper>
          <Content />
        </MessageWrapper>
      )}
    </>
  );
};
