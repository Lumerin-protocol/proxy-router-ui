import { HashRentalContract } from '../../types';
import EastIcon from '@mui/icons-material/East';
import styled from '@emotion/styled';

export const BuyerOrdersWidget = (prop: {
	contracts: Array<HashRentalContract>;
	userAccount: string;
}) => {
	const buyerOrders = prop.contracts.filter((contract) => contract.buyer === prop.userAccount);

	const BuyerOrdersWrapper = styled.div`
		padding: 0.5rem 1.25rem;
		margin-bottom: 0.75rem;
		border-radius: 15px;
		background-color: #fff;
		flex: 1 1 auto;
		justify-content: center;
		min-width: 250px;
	`;

	return (
		<BuyerOrdersWrapper className='widget'>
			<p className='text-xs text-center'>Purchased Contracts</p>
			<div>
				<h3 className='flex-1 text-center text-lumerin-blue-text text-xl'>{buyerOrders.length}</h3>
				<p className='text-xs text-center'>ACTIVE</p>
			</div>
			<p className='text-xxs text-center border-t-2 border-lumerin-light-gray pt-1.5'>
				<a href='/buyerhub'>
					View all purchased contracts <EastIcon style={{ fontSize: '0.75rem' }} />
				</a>
			</p>
		</BuyerOrdersWrapper>
	);
};
