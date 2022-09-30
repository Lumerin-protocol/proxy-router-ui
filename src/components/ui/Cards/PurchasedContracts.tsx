import { AddressLength, HashRentalContract } from '../../../types';
import { getHostName, getReadableDate, getWorkerName, truncateAddress } from '../../../utils';
import { getStatusDiv } from '../../../utils';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import Calendar from '../../../images/icons/calendar.png';
import IDCard from '../../../images/icons/id-card.png';
import PriceTag from '../../../images/icons/price-tag.png';
import Pickaxe from '../../../images/icons/pickaxe.png';
import Speed from '../../../images/icons/download-speed.png';
import Time from '../../../images/icons/time-left.png';
import { ContractCards } from './PurchasedContracts.styled';

export const PurchasedContracts = (prop: {
	contracts: Array<HashRentalContract>;
	isCompleted: boolean;
}) => {
	const progressAscending = [...prop.contracts].sort(
		(a, b) => a.progressPercentage! - b.progressPercentage!
	);

	return (
		<ContractCards>
			{progressAscending.map((item, index) => (
				// <div className='bg-white rounded-15 mb-3 p-7 w-full flex flex-row justify-between items-center'>
				<div className='card' key={item.contractId}>
					<div className='utils'>
						<p>
							<a
								href={`https://goerli.etherscan.io/address/${item.contractId}`}
								target='_blank'
								rel='noreferrer'
							>
								{truncateAddress(item.contractId!, AddressLength.LONG)}
							</a>
						</p>
						{!prop.isCompleted && (
							<div className='status'>
								<p className='status-badge'>{getStatusDiv(item.state as string)}</p>
								<p>{item.editCancel}</p>
							</div>
						)}
					</div>
					<div className='grid'>
						<div className='progress'>
							<CircularProgressbar
								value={item.progressPercentage!}
								text={`${item.progressPercentage?.toFixed()}%`}
								strokeWidth={5}
								styles={buildStyles({
									strokeLinecap: 'round',
									pathColor: '#0F4454',
									trailColor: '#EAF7FC',
									textColor: '#0F4454',
								})}
							/>
						</div>
						<div className='item-value started'>
							<img src={Calendar} alt='' />
							<div>
								<h3>Started</h3>
								<p>{item.timestamp}</p>
							</div>
						</div>
						<div className='item-value speed'>
							<img src={Speed} alt='' />
							<div>
								<h3>Speed</h3>
								<p>{item.speed} th/s</p>
							</div>
						</div>
						<div className='item-value price'>
							<img src={PriceTag} alt='' />
							<div>
								<h3>Price</h3>
								<p>{item.price} LMR</p>
							</div>
						</div>
						<div className='item-value username'>
							<img src={IDCard} alt='' />
							<div>
								<h3>Username</h3>
								<p>{item.encryptedPoolData && getWorkerName(item.encryptedPoolData)} </p>
							</div>
						</div>
						<div className='item-value duration'>
							<img src={Time} alt='' />
							<div>
								<h3>Duration</h3>
								<p>{item.length && getReadableDate(item.length)}</p>
							</div>
						</div>
						<div className='item-value address'>
							<img src={Pickaxe} alt='' />
							<div>
								<h3>Pool Address</h3>
								<p>{item.encryptedPoolData && getHostName(item.encryptedPoolData)}</p>
							</div>
						</div>
					</div>
				</div>
			))}
		</ContractCards>
	);
};
