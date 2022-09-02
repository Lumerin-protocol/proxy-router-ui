import { HashRentalContract } from '../../types';
import { getReadableDate } from '../../utils';

export const AvailableContracts = (prop: { contracts: Array<HashRentalContract> }) => {
	return (
		<>
			{prop.contracts.map((item, index) => (
				<div className='bg-white rounded-15 mb-3 p-5 w-full flex flex-row justify-between'>
					<a className='underline' href={item.contractId}>
						View Contract
					</a>
					<p>{item.speed} th/s</p>
					{item.length && <p>{getReadableDate(item.length)}</p>}
					{item.trade}
				</div>
			))}
		</>
	);
};
