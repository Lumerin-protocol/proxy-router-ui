import { ContractData, HashRentalContract } from '../../../types';
import EastIcon from '@mui/icons-material/East';
import styled from '@emotion/styled';
import { isEmpty } from 'lodash';
import { getProgressPercentage } from '../../../utils';
import { SmallWidget } from '../Cards/Cards.styled';
import { Skeleton } from '@mui/material';

export const BuyerOrdersWidget = (props: {
	contracts: Array<HashRentalContract>;
	userAccount: string;
	currentBlockTimestamp: number;
	isLoading: boolean;
}) => {
	const buyerOrders = props.contracts.filter(
		(contract: HashRentalContract) => contract.buyer === props.userAccount
	);

	const updatedOrders: Array<HashRentalContract> = buyerOrders.map(
		(contract: HashRentalContract) => {
			const updatedOrder = { ...contract } as ContractData;
			if (!isEmpty(contract)) {
				updatedOrder.progressPercentage = getProgressPercentage(
					updatedOrder.state as string,
					updatedOrder.timestamp as string,
					parseInt(updatedOrder.length as string),
					props.currentBlockTimestamp
				);
				return updatedOrder as ContractData;
			}
			return updatedOrders;
		}
	);

	const runningContracts = [
		...updatedOrders.filter((contract: HashRentalContract) => contract.progressPercentage! < 100),
	];
	const completedContracts = [
		...updatedOrders.filter((contract: HashRentalContract) => contract.progressPercentage === 100),
	];

	const BuyerOrdersWrapper = styled(SmallWidget)`
		.stats {
			display: flex;
			justify-content: space-around;
			width: 80%;
			padding: 0.75rem;
		}

		.active {
			color: #0e4353;
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
			<h3>Purchased Contracts</h3>
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
							completedContracts.length
						)}
					</h4>
					<p>COMPLETED</p>
				</div>
			</div>
			<div className='link'>
				<a href='/buyerhub'>
					View all purchased contracts <EastIcon style={{ fontSize: '0.75rem' }} />
				</a>
			</div>
		</BuyerOrdersWrapper>
	);
};
