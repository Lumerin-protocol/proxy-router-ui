import { ContractData, HashRentalContract } from '../../types';
import EastIcon from '@mui/icons-material/East';
import styled from '@emotion/styled';
import { isEmpty } from 'lodash';
import { getProgressPercentage } from '../../utils';

export const BuyerOrdersWidget = (props: {
	contracts: Array<HashRentalContract>;
	userAccount: string;
	currentBlockTimestamp: number;
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

	const BuyerOrdersWrapper = styled.div`
		padding: 0.5rem 1.25rem;
		margin-bottom: 0.75rem;
		border-radius: 15px;
		background-color: #fff;
		flex: 1 1 auto;
		justify-content: center;
		min-width: 250px;

		.stats {
			display: flex;
			justify-content: space-around;
			padding: 0.75rem;
		}

		.stat {
			h3 {
				font-size: 1.75rem;
				line-height: 1.75rem;
				text-align: center;
				flex: 1 1 0%;
				margin-bottom: 0.15rem;
			}
			p {
				font-size: 0.75rem;
				text-align: center;
			}
		}
	`;

	return (
		<BuyerOrdersWrapper className='widget'>
			<p className='text-xs text-center'>Purchased Contracts</p>
			<div className='stats'>
				<div className='stat'>
					<h3 className='flex-1 text-center text-lumerin-blue-text text-xl'>
						{runningContracts.length}
					</h3>
					<p>ACTIVE</p>
				</div>
				<div className='stat'>
					<h3 className='flex-1 text-center text-lumerin-blue-text text-xl'>
						{completedContracts.length}
					</h3>
					<p>COMPLETED</p>
				</div>
			</div>
			<p className='text-xxs text-center border-t-2 border-lumerin-light-gray pt-1.5'>
				<a href='/buyerhub'>
					View all purchased contracts <EastIcon style={{ fontSize: '0.75rem' }} />
				</a>
			</p>
		</BuyerOrdersWrapper>
	);
};
