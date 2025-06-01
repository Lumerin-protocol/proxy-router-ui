import styled from "@mui/material/styles/styled";
import EastIcon from "@mui/icons-material/East";
import Skeleton from "@mui/material/Skeleton";
import { useNavigate } from "react-router";
import { useAccount } from "wagmi";
import { ContractState, type HashRentalContract, PathName } from "../../types/types";
import { SmallWidget } from "../Cards/Cards.styled";

export const BuyerOrdersWidget = (props: {
  contracts: HashRentalContract[];
  isLoading: boolean;
}) => {
  const navigate = useNavigate();
  const { address: userAccount } = useAccount();

  let runningContracts = 0;
  let completedContracts = 0;

  for (const contract of props.contracts) {
    if (contract.buyer === userAccount) {
      if (contract.state === ContractState.Running) {
        runningContracts++;
      }
      completedContracts += contract.history?.length ?? 0;
    }
  }

  return (
    <BuyerOrdersWrapper>
      <h3>Purchased Contracts</h3>
      <div className="stats">
        <div className="stat active">
          <h4>{props.isLoading ? <Skeleton variant="rectangular" width={40} height={28} /> : runningContracts}</h4>
          <p>ACTIVE</p>
        </div>
        <div className="stat completed">
          <h4>{props.isLoading ? <Skeleton variant="rectangular" width={40} height={28} /> : completedContracts}</h4>
          <p>FINISHED</p>
        </div>
      </div>
      <div className="link">
        <button type="button" onClick={() => navigate(PathName.BuyerHub)}>
          View purchased contracts <EastIcon style={{ fontSize: "0.75rem" }} />
        </button>
      </div>
    </BuyerOrdersWrapper>
  );
};

const BuyerOrdersWrapper = styled(SmallWidget)`
  .stats {
    display: flex;
    justify-content: space-around;
    width: 80%;
    padding: 0.75rem;
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
