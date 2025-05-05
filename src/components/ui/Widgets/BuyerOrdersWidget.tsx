import { ContractState, HashRentalContract } from '../../../types';
import EastIcon from '@mui/icons-material/East';
import styled from '@emotion/styled';
import { isEmpty } from 'lodash';
import { getProgressPercentage } from '../../../utils';
import { SmallWidget } from '../Cards/Cards.styled';
import { Skeleton } from '@mui/material';
import { useHistory } from 'react-router-dom';

export const BuyerOrdersWidget = (props: {
	contracts: Array<HashRentalContract>;
	userAccount: string;
	currentBlockTimestamp: number;
	isLoading: boolean;
}) => {
	const history = useHistory();

	const buyerOrders = props.contracts.filter(
		(contract: HashRentalContract) => contract.buyer === props.userAccount
	);

	const updatedOrders: HashRentalContract[] = buyerOrders.map((contract: HashRentalContract) => {
		const updatedOrder = { ...contract };
		if (!isEmpty(contract)) {
			updatedOrder.progressPercentage = getProgressPercentage(
				updatedOrder.state as string,
				updatedOrder.timestamp as string,
				parseInt(updatedOrder.length as string),
				props.currentBlockTimestamp
			);
			return updatedOrder;
		}
		return updatedOrder;
	});

	const runningContracts = [
		...updatedOrders.filter(
			(contract: HashRentalContract) =>
				contract.progressPercentage! < 100 && contract.state === ContractState.Running
		),
	];
	const completedContractsAmount = [
		...props.contracts.map((contract: HashRentalContract) => contract.history),
	].flat().length;

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

	return (
		<BuyerOrdersWrapper>
			<h3>Your Contracts</h3>
			<div className='stats'>
				<div className='stat active'>
					<h4>
						{props.isLoading ? (
							<Skeleton variant='rectangular' width={40} height={28} />
						) : (
							runningContracts.length
						)}
					</h4>
					<p>ACTIVE</p>
				</div>
				<div className='stat completed'>
					<h4>
						{props.isLoading ? (
							<Skeleton variant='rectangular' width={40} height={28} />
						) : (
							completedContractsAmount
						)}
					</h4>
					<p>FINISHED</p>
				</div>
			</div>
			<div className='link'>
				<button onClick={() => history.push('buyerhub')}>
					View all purchased contracts <EastIcon style={{ fontSize: '0.75rem' }} />
				</button>
			</div>
		</BuyerOrdersWrapper>
	);
};
