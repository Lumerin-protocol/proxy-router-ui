import { HashRentalContract } from '../../types';
import EastIcon from '@mui/icons-material/East';

export const BuyerOrdersWidget = (prop: {
	contracts: Array<HashRentalContract>;
	userAccount: string;
}) => {
	const buyerOrders = prop.contracts.filter((contract) => contract.buyer === prop.userAccount);

	return (
		<>
			<div className='bg-white rounded-15 mb-3 px-5 py-2 w-32 h-32 flex-auto justify-center'>
				<p className='text-xs text-center'>Purchased Contracts</p>
				<div>
					<h3 className='flex-1 text-center text-lumerin-blue-text text-xl'>
						{buyerOrders.length}
					</h3>
					<p className='text-xs text-center'>ACTIVE</p>
				</div>
				<p className='text-xxs text-center border-t-2 border-lumerin-light-gray pt-1.5'>
					<a href='/buyerhub'>
						View all purchased contracts <EastIcon style={{ fontSize: '0.75rem' }} />
					</a>
				</p>
			</div>
		</>
	);
};
