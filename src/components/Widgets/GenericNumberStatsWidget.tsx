import styled from "@emotion/styled";
import EastIcon from "@mui/icons-material/East";
import { Skeleton } from "@mui/material";
import { useNavigate } from "react-router";
import { useAccount } from "wagmi";
import { SmallWidget } from "../Cards/Cards.styled";
import type { ReactNode } from "react";
import { classNames } from "../../utils/utils";

type Props = {
  data: {
    title: string;
    value: string;
    dim?: boolean;
  }[];
  title: string;
  isLoading?: boolean;
  contentUnderneath?: ReactNode;
};

export const GenericNumberStatsWidget = (props: Props) => {
  return (
    <Wrapper>
      <h3>{props.title}</h3>
      <div className="stats">
        {props.data.map((item) => (
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

const Wrapper = styled(SmallWidget)`
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
