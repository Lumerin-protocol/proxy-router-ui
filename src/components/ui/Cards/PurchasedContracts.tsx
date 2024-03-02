import {
	AddressLength,
	ContractData,
	ContractHistoryData,
	HashRentalContract,
} from '../../../types';
import { getReadableDate, truncateAddress } from '../../../utils';
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
import CancelIcon from '@mui/icons-material/CancelOutlined';

import styled from '@emotion/styled';
import { HistoryUglyMapped } from '../../../pages/MyOrders';

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

const getIcon = (contract: any, isCompleted = false) => {
	const isGoodCloseout = contract.progressPercentage === 100;
	if (isCompleted) {
		if (isGoodCloseout) {
			return <DoneIcon sx={{ color: 'white' }} />;
		}
		return <CancelIcon sx={{ color: 'white' }} />;
	}
	return <img src={PickaxeAnimated} alt='' />;
};

interface CardProps {
	progressPercentage: number;
	editCancel: JSX.Element;
	timestamp: string;
	endDate: string;
	contractId: string;
	speed: string;
	price: number;
	length: string;
}

const getCard = (key: string, item: CardProps, poolInfo: any, isCompleted = false) => (
	<div className='card' key={key}>
		<div className='progress'>
			<div className='pickaxe'>{getIcon(item, isCompleted)}</div>
			<div className='utils'>
				<div className='percentage-and-actions'>
					<h2>{item.progressPercentage?.toFixed()}% complete</h2>
					{!isCompleted && (
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
						<p>{item.endDate}</p>
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
			{!isCompleted && (
				<>
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
				</>
			)}
		</div>
	</div>
);

export const PurchasedContracts = (props: { contracts: HistoryUglyMapped[]; sortType: string }) => {
	const progressAscending = [...props.contracts].sort(
		(a, b) => a.progressPercentage! - b.progressPercentage!
	);

	const purchasedContracts = props.sortType ? props.contracts : progressAscending;

	return (
		<ContractCards>
			{purchasedContracts.map((item, index) => {
				const stored = localStorage.getItem(item.contractId!);
				const poolInfo = stored ? JSON.parse(stored) : '';

				return getCard(`${item.contractId}`, item, poolInfo, false);
			})}
		</ContractCards>
	);
};

export const FinishedContracts = (props: { contracts: HistoryUglyMapped[]; sortType: string }) => {
	const purchastTimeAscending = [...props.contracts].sort(
		(a, b) => +b._purchaseTime! - +a._purchaseTime!
	);
	const purchasedContracts = props.sortType ? props.contracts : purchastTimeAscending;

	return (
		<ContractCards>
			{purchasedContracts.map((item) => {
				const stored = localStorage.getItem(item.contractId!);
				const poolInfo = stored ? JSON.parse(stored) : '';

				return getCard(`${item.contractId}-${item._purchaseTime}`, item, poolInfo, true);
			})}
		</ContractCards>
	);
};
