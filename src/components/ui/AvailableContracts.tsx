import { HashRentalContract } from '../../types';

export const AvailableContracts = (prop: { contracts: Array<HashRentalContract> }) => {
	return (
		<>
			{prop.contracts.map((item, index) => (
				<div className='bg-white rounded-15 mb-3 p-5'>
					<h2>{item.seller}</h2>
					<p>{item.speed} th/s</p>
					<p>{item.length}</p>
					{item.trade}
				</div>
			))}
		</>
	);
};
