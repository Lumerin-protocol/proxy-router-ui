import { HashRentalContract } from '../../../types';
import { getReadableDate } from '../../../utils';
import SpeedIcon from '../../../images/icons/download-speed.png';
import PriceIcon from '../../../images/icons/price-tag.png';
import TimeIcon from '../../../images/icons/time-left.png';
import { AvailableContract } from './AvailableContract.styled';

export const AvailableContracts = (prop: { contracts: Array<HashRentalContract> }) => {
	return (
		<div className='overflow-visible w-full'>
			{prop.contracts.map((item, index) => (
				<AvailableContract>
					<a
						className='underline pb-0 font-Raleway cursor-pointer'
						href={`https://ropsten.etherscan.io/address/${item.contractId}`}
						target='_blank'
						rel='noreferrer'
					>
						View Contract
					</a>
					<p>
						<img src={SpeedIcon} alt='' />
						{item.speed} th/s
					</p>
					{item.length && (
						<p>
							<img src={TimeIcon} alt='' />
							{getReadableDate(item.length)}
						</p>
					)}
					<p>
						<img src={PriceIcon} alt='' />
						{item.price} LMR
					</p>
					{item.trade}
				</AvailableContract>
			))}
		</div>
	);
};
