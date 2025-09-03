import styled from "@mui/material/styles/styled";
import Skeleton from "@mui/material/Skeleton";
import { SmallWidget } from "../Cards/Cards.styled";
import type { ReactNode } from "react";
import { classNames } from "../../utils/classNames";
import { css, SerializedStyles } from "@emotion/react";

type Props = {
  data: {
    title: string;
    value: string;
    dim?: boolean;
  }[];
  title: string;
  isLoading?: boolean;
  contentUnderneath?: ReactNode;
  isConnected?: boolean;
  disconnectedMessage?: ReactNode;
  maxWidth?: string;
};

export const GenericNumberStatsWidget = (props: Props) => {
  return (
    <Wrapper $maxWidth={props.maxWidth}>
      <h3>{props.title}</h3>
      <div className="stats">
        {props.isConnected === false && <div>{props.disconnectedMessage}</div>}

        {(props.isConnected === undefined || props.isConnected === true) &&
          props.data.map((item) => (
            <div className={classNames("stat", item.dim ? "completed" : "active")} key={item.title}>
              <h4>{props.isLoading ? <Skeleton variant="rectangular" width={40} height={28} /> : item.value}</h4>
              <p>{item.title}</p>
            </div>
          ))}
      </div>
      <div className="link">{props.contentUnderneath}</div>
    </Wrapper>
  );
};

const Wrapper = styled(SmallWidget, {
  shouldForwardProp: (prop) => typeof prop === "string" && !prop.startsWith("$"),
})<{ $maxWidth?: string }>`
  ${({ $maxWidth }) =>
    $maxWidth &&
    css`
      max-width: ${$maxWidth};
    `}
  .stats {
    display: flex;
    justify-content: space-around;
    padding: 0.75rem 0;
    gap: 0rem 0.5rem;
    width: 100%;
  }

  .active {
    color: #fff;
  }
  .completed {
    color: #a7a9b6;
  }

  .stat {
    h4 {
      font-size: 1.85rem;
      line-height: 1.75rem;
      text-align: center;
      flex: 1 1 0%;
      margin-bottom: 0.15rem;
      display: flex;
      justify-content: center;
    }
    p {
      font-size: 0.625rem;
      text-align: center;
    }
  }
`;
