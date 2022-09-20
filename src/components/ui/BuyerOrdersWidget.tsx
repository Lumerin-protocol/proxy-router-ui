import { HashRentalContract } from '../../types';
import EastIcon from '@mui/icons-material/East';
import styled from '@emotion/styled';

export const BuyerOrdersWidget = (prop: {
	contracts: Array<HashRentalContract>;
	userAccount: string;
}) => {
	const buyerOrders = prop.contracts.filter((contract) => contract.buyer === prop.userAccount);
	console.log(buyerOrders);

	const OrdersWidget = styled.div`
		padding-top: 0.5rem;
		padding-bottom: 0.5rem;
		padding-left: 1.25rem;
		padding-right: 1.25rem;
		margin-bottom: 0.75rem;
		background-color: #ffffff;
		flex: 1 1 auto;
		justify-content: center;
		width: 8rem;
		height: 8rem;

		h3,
		.status {
			font-size: 0.8125rem;
			text-align: center;
		}

		.content {
			display: flex;
			flex-direction: row;
			justify-content: space-around;
		}
	`;

	const runningContracts = prop.contracts.filter((contract) => contract.progressPercentage! < 100);
	const completedContracts = prop.contracts.filter(
		(contract) => contract.progressPercentage === 100
	);

	return (
		<OrdersWidget>
			<h3>Purchased Contracts</h3>
			<div className='content'>
				<div>
					<h4 className='text-center text-lumerin-blue-text text-xl'>{runningContracts.length}</h4>
					<p className='status'>ACTIVE</p>
				</div>
				<div className='text-lumerin-inactive-grey '>
					<h4 className='text-center text-xl'>{completedContracts.length}</h4>
					<p className='status'>Completed</p>
				</div>
			</div>
			<p className='text-xxs text-center border-t-2 border-lumerin-light-gray pt-1.5'>
				<a href='/buyerhub'>
					View all purchased contracts <EastIcon style={{ fontSize: '0.75rem' }} />
				</a>
			</p>
		</OrdersWidget>
	);
};
