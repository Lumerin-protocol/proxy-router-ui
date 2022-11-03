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

export const PurchasedContracts = (props: {
	contracts: Array<HashRentalContract>;
	isCompleted: boolean;
	sortType: string;
}) => {
	const progressAscending = [...props.contracts].sort(
		(a, b) => a.progressPercentage! - b.progressPercentage!
	);

	const purchasedContracts = props.sortType ? props.contracts : progressAscending;

	return (
		<ContractCards>
			{purchasedContracts.map((item, index) => (
				// <div className='bg-white rounded-15 mb-3 p-7 w-full flex flex-row justify-between items-center'>
				<div className='card' key={item.contractId}>
					<div className='utils'>
						<p>
							<a
								href={process.env.REACT_APP_ETHERSCAN_URL + `${item.contractId}`}
								target='_blank'
								rel='noreferrer'
							>
								{truncateAddress(item.contractId!, AddressLength.LONG)}
							</a>
						</p>
						{!props.isCompleted && (
							<div className='status'>
								<div className='status-badge'>{getStatusDiv(item.state as string)}</div>
								<div>{item.editCancel}</div>
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
								<p>{item.length && getReadableDate(item.length.toString())}</p>
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
