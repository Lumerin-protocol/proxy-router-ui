import { AddressLength, HashRentalContract } from '../../../types';
import { getHostName, getReadableDate, getWorkerName, truncateAddress } from '../../../utils';
import 'react-circular-progressbar/dist/styles.css';
import PickaxeAnimated from '../../../images/icons/pickaxe-animated.gif';
import IDCard from '../../../images/icons/id-card.png';
import PriceTag from '../../../images/icons/price-tag.png';
import Pickaxe from '../../../images/icons/pickaxe.png';
import Speed from '../../../images/icons/download-speed.png';
import Time from '../../../images/icons/time-left.png';
import { ContractCards } from './PurchasedContracts.styled';
import { Divider, LinearProgress, linearProgressClasses } from '@mui/material';
import DoneIcon from '@mui/icons-material/Done';
import styled from '@emotion/styled';

export const PurchasedContracts = (props: {
	contracts: Array<HashRentalContract>;
	isCompleted: boolean;
	sortType: string;
}) => {
	const progressAscending = [...props.contracts].sort(
		(a, b) => a.progressPercentage! - b.progressPercentage!
	);

	const purchasedContracts = props.sortType ? props.contracts : progressAscending;

	const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
		height: 10,
		borderRadius: 5,
		[`&.${linearProgressClasses.colorPrimary}`]: {
			backgroundColor: '#B5D3DD',
		},
		[`& .${linearProgressClasses.bar}`]: {
			borderRadius: 5,
			backgroundColor: '#0E4353',
		},
	}));

	return (
		<ContractCards>
			{purchasedContracts.map((item, index) => {
				const stored = localStorage.getItem(item.contractId!);
				const poolInfo = stored ? JSON.parse(stored) : '';

				return (
					<div className='card' key={item.contractId}>
						<div className='progress'>
							<div className='pickaxe'>
								{props.isCompleted ? (
									<DoneIcon sx={{ color: 'white' }} />
								) : (
									<img src={PickaxeAnimated} alt='' />
								)}
							</div>
							<div className='utils'>
								<div className='percentage-and-actions'>
									<h2>{item.progressPercentage?.toFixed()}% complete</h2>
									{!props.isCompleted && (
										<div className='status'>
											<div>{item.editCancel}</div>
										</div>
									)}
								</div>
								<BorderLinearProgress variant='determinate' value={item.progressPercentage} />
							</div>
						</div>
						<div className='grid'>
							<div className='row'>
								<div className='item-value started'>
									<div>
										<h3>CONTRACT START</h3>
										<p>{item.timestamp}</p>
									</div>
								</div>
								<div className='item-value started'>
									<div>
										<h3>CONTRACT END</h3>
										<p>{item.timestamp}</p>
									</div>
								</div>
							</div>
							<div className='item-value address'>
								<div>
									<h3>CONTRACT ADDRESS</h3>
									<a
										href={process.env.REACT_APP_ETHERSCAN_URL + `${item.contractId}`}
										target='_blank'
										rel='noreferrer'
									>
										{truncateAddress(item.contractId!, AddressLength.LONG)}
									</a>
								</div>
							</div>
							<div className='row'>
								<div className='item-value speed'>
									<img src={Speed} alt='' />
									<div>
										<h3>SPEED</h3>
										<p>{item.speed} th/s</p>
									</div>
								</div>
								<div className='item-value price'>
									<img src={PriceTag} alt='' />
									<div>
										<h3>PRICE</h3>
										<p>{item.price} LMR</p>
									</div>
								</div>
								<div className='item-value duration'>
									<img src={Time} alt='' />
									<div>
										<h3>DURATION</h3>
										<p>{item.length && getReadableDate(item.length.toString())}</p>
									</div>
								</div>
							</div>
							<Divider variant='middle' sx={{ my: 2 }} />
							<h3 className='sm-header'>POOL CONNECTION</h3>
							<div className='item-value username'>
								<img src={IDCard} alt='' />
								<div>
									<p>{poolInfo?.poolAddress || ''} </p>
								</div>
							</div>
							<div className='item-value address'>
								<img src={Pickaxe} alt='' />
								<div>
									<p>{poolInfo?.username || ''}</p>
								</div>
							</div>
						</div>
					</div>
				);
			})}
		</ContractCards>
	);
};
