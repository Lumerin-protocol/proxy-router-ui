import styled from "@emotion/styled";
import EastIcon from "@mui/icons-material/East";
import { Skeleton } from "@mui/material";
import { isEmpty } from "lodash";
import { useNavigate } from "react-router";
import { useAccount } from "wagmi";
import { useSimulatedBlockchainTime } from "../../hooks/data/useSimulatedBlockchainTime";
import { ContractState, type HashRentalContract, PathName } from "../../types/types";
import { getProgressPercentage } from "../../utils/utils";
import { SmallWidget } from "../Cards/Cards.styled";

export const BuyerOrdersWidget = (props: {
  contracts: HashRentalContract[];
  isLoading: boolean;
}) => {
  const navigate = useNavigate();
  const { address: userAccount } = useAccount();

  const buyerOrders = props.contracts.filter((contract: HashRentalContract) => contract.buyer === userAccount);

  const currentBlockTimestamp = useSimulatedBlockchainTime();

  const updatedOrders: HashRentalContract[] = buyerOrders.map((contract: HashRentalContract) => {
    const updatedOrder = { ...contract };
    if (!isEmpty(contract)) {
      updatedOrder.progressPercentage = getProgressPercentage(
        updatedOrder.state as string,
        updatedOrder.timestamp as string,
        Number.parseInt(updatedOrder.length as string),
        Number(currentBlockTimestamp),
      );
      return updatedOrder;
    }
    return updatedOrder;
  });

  const runningContracts = updatedOrders.filter(
    (c) => c.progressPercentage! < 100 && c.state === ContractState.Running,
  );
  const completedContractsAmount = props.contracts.flatMap((contract: HashRentalContract) => contract.history).length;

  return (
    <BuyerOrdersWrapper>
      <h3>Your Contracts</h3>
      <div className="stats">
        <div className="stat active">
          <h4>
            {props.isLoading ? <Skeleton variant="rectangular" width={40} height={28} /> : runningContracts.length}
          </h4>
          <p>ACTIVE</p>
        </div>
        <div className="stat completed">
          <h4>
            {props.isLoading ? <Skeleton variant="rectangular" width={40} height={28} /> : completedContractsAmount}
          </h4>
          <p>FINISHED</p>
        </div>
      </div>
      <div className="link">
        <button onClick={() => navigate(PathName.BuyerHub)}>
          View all purchased contracts <EastIcon style={{ fontSize: "0.75rem" }} />
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
