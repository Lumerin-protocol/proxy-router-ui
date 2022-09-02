import { HashRentalContract } from '../../types';

export const BuyerOrdersWidget = (prop: {
	contracts: Array<HashRentalContract>;
	userAccount: string;
}) => {
	const buyerOrders = prop.contracts.filter((contract) => contract.buyer === prop.userAccount);
	console.log(buyerOrders);

	return (
		<>
			<div className='bg-white rounded-15 mb-3 p-5 flex flex-col justify-center'>
				<p className='text-xs'>Purchased Contracts</p>
				<h3 className='text-center text-xl'>{buyerOrders.length}</h3>
				<p className='text-md text-center'>Active</p>
			</div>
		</>
	);
};
