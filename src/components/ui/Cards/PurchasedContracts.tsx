import { HashRentalContract } from '../../../types';
import { getReadableDate } from '../../../utils';
import { stringToURI } from '../../../utils';
import { getStatusDiv } from '../../../utils';

export const PurchasedContracts = (prop: { contracts: Array<HashRentalContract> }) => {
	console.log(prop.contracts);

	const getWorkerName = (connectionString: string): string | undefined =>
		stringToURI(connectionString).userinfo?.replace(/:$/, '');

	const getHostName = (connectionString: string): string | undefined =>
		stringToURI(connectionString).host;

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
					<p>{getStatusDiv(item.state as string)}</p>
					<p className='pb-0'>{item.speed} th/s</p>
					<p>{item.timestamp}</p>
					<p>{item.price} LMR</p>
					<p>{item.encryptedPoolData && getWorkerName(item.encryptedPoolData)}</p>
					<p>{item.encryptedPoolData && getHostName(item.encryptedPoolData)}</p>
					{item.length && <p className='pb-0'>{getReadableDate(item.length)}</p>}
					{item.progress}
					<p>{item.editCancel}</p>
				</div>
			))}
		</div>
	);
};
