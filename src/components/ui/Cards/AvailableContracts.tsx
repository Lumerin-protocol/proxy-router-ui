import { HashRentalContract } from '../../../types';
import { getReadableDate } from '../../../utils';

export const AvailableContracts = (prop: { contracts: Array<HashRentalContract> }) => {
	return (
		<div className='overflow-visible w-full'>
			{prop.contracts.map((item, index) => (
				<div className='bg-white rounded-15 mb-3 p-7 w-full flex flex-row justify-between items-center'>
					<a
						className='underline pb-0 font-Raleway cursor-pointer'
						href={`https://ropsten.etherscan.io/address/${item.contractId}`}
						target='_blank'
						rel='noreferrer'
					>
						View Contract
					</a>
					<p className='pb-0'>{item.speed} th/s</p>
					{item.length && <p className='pb-0'>{getReadableDate(item.length)}</p>}
					{item.trade}
				</div>
			))}
		</div>
	);
};
