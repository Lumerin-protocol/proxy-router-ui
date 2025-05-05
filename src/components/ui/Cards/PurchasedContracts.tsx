import { AddressLength, HashRentalContract } from '../../../types';
import { getProgressPercentage, getReadableDate, truncateAddress } from '../../../utils';
import 'react-circular-progressbar/dist/styles.css';
import PickaxeAnimated from '../../../images/icons/pickaxe-animated.gif';
import IDCard from '../../../images/id-card-white.png';
import Pickaxe from '../../../images/pickaxe-white.png';
import Speed from '../../../images/icons/speed-icon-white.png';
import PriceTag from '../../../images/icons/price-icon-white.png';
import Time from '../../../images/icons/time-icon-white.png';
import { ContractCards } from './PurchasedContracts.styled';
import { Divider, LinearProgress, linearProgressClasses } from '@mui/material';
import DoneIcon from '@mui/icons-material/Done';
import CancelIcon from '@mui/icons-material/CancelOutlined';

import styled from '@emotion/styled';
import { HistoryUglyMapped } from '../../MyOrders';
import { formatFeePrice, formatPaymentPrice, formatTHPS } from '../../units';
import { DateTime } from 'luxon';
import { EditButton } from '../Forms/FormButtons/EditButton';
import { CancelButton } from '../Forms/FormButtons/CancelButton';
import { ButtonGroup } from '../ButtonGroup';

const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
	height: 10,
	borderRadius: 5,
	[`&.${linearProgressClasses.colorPrimary}`]: {
		backgroundColor: '#000',
	},
	[`& .${linearProgressClasses.bar}`]: {
		borderRadius: 5,
		backgroundColor: '#fff',
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

export type Card = {
	startTime: number;
	endTime: number;
	progressPercentage: number;
	contractAddr: string;
	speedHps: string;
	price: string;
	fee: string;
	length: string;
	poolAddress: string;
	poolUsername: string;
};
interface CardProps {
	card: Card;
	key?: string;
	editClickHandler: (event: React.MouseEvent<HTMLButtonElement>) => void;
	cancelClickHandler: (event: React.MouseEvent<HTMLButtonElement>) => void;
	setContractId: (id: string) => void;
}

const Card = (props: CardProps) => {
	const { card: item, editClickHandler, cancelClickHandler, setContractId } = props;

	const startDate = DateTime.fromSeconds(item.startTime).toFormat('MM/dd/yyyy');
	const endDate = DateTime.fromSeconds(item.endTime).toFormat('MM/dd/yyyy');
	const isCompleted = item.progressPercentage >= 100;
	return (
		<div className='card'>
			<div className='progress'>
				<div className='pickaxe'>{getIcon(item, isCompleted)}</div>
				<div className='utils'>
					<div className='percentage-and-actions'>
						<h2>{item.progressPercentage.toFixed()}% complete</h2>
						{!isCompleted && (
							<div className='status'>
								<div>
									<ButtonGroup
										button1={
											<EditButton
												contractId={item.contractAddr}
												setContractId={setContractId}
												editClickHandler={editClickHandler}
											/>
										}
										button2={
											<CancelButton
												contractId={item.contractAddr}
												setContractId={setContractId}
												cancelClickHandler={cancelClickHandler}
											/>
										}
									/>
								</div>
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
							<p>{startDate}</p>
						</div>
					</div>
					<div className='item-value started'>
						<div>
							<h3>CONTRACT END</h3>
							<p>{endDate}</p>
						</div>
					</div>
				</div>
				<div className='item-value address'>
					<div>
						<h3>CONTRACT ADDRESS</h3>
						<a
							href={process.env.REACT_APP_ETHERSCAN_URL + `${item.contractAddr}`}
							target='_blank'
							rel='noreferrer'
						>
							{item.contractAddr ? truncateAddress(item.contractAddr, AddressLength.LONG) : '…'}
						</a>
					</div>
				</div>
				<div className='terms'>
					<div className='item-value speed'>
						<img src={Speed} alt='' />
						<div>
							<h3>SPEED</h3>
							<p>{formatSpeed(item.speedHps)}</p>
						</div>
					</div>
					<div className='item-value price'>
						<img src={PriceTag} alt='' />
						<div>
							<h3>PRICE</h3>
							<p>{formatPaymentPrice(item.price).full}</p>
						</div>
					</div>
					<div className='item-value price'>
						<img src={PriceTag} alt='' />
						<div>
							<h3>FEE</h3>
							<p>{formatFeePrice(item.fee).full}</p>
						</div>
					</div>
					<div className='item-value duration'>
						<img src={Time} alt='' />
						<div>
							<h3>DURATION</h3>
							<p>{formatDuration(item.length)}</p>
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
								<p>{item.poolAddress} </p>
							</div>
						</div>
						<div className='item-value address'>
							<img src={Pickaxe} alt='' />
							<div>
								<p>{item.poolUsername}</p>
							</div>
						</div>
					</>
				)}
			</div>
		</div>
	);
};

export const PurchasedContracts = (props: {
	contracts: Card[];
	sortType: string;
	editClickHandler: (event: React.MouseEvent<HTMLButtonElement>) => void;
	cancelClickHandler: (event: React.MouseEvent<HTMLButtonElement>) => void;
	setContractId: (id: string) => void;
}) => {
	const progressAscending = [...props.contracts].sort(
		(a, b) => a.progressPercentage! - b.progressPercentage!
	);

	const purchasedContracts = props.sortType ? props.contracts : progressAscending;

	return (
		<ContractCards>
			{purchasedContracts.map((item, index) => {
				return (
					<Card
						key={item.contractAddr}
						card={item}
						editClickHandler={props.editClickHandler}
						cancelClickHandler={props.cancelClickHandler}
						setContractId={props.setContractId}
					/>
				);
			})}
		</ContractCards>
	);
};

export const FinishedContracts = (props: {
	contracts: Card[];
	sortType: string;
	editClickHandler: (event: React.MouseEvent<HTMLButtonElement>) => void;
	cancelClickHandler: (event: React.MouseEvent<HTMLButtonElement>) => void;
	setContractId: (id: string) => void;
}) => {
	const purchastTimeAscending = [...props.contracts].sort((a, b) => +b.startTime! - +a.startTime!);
	const purchasedContracts = props.sortType ? props.contracts : purchastTimeAscending;

	return (
		<ContractCards>
			{purchasedContracts.map((item) => {
				return (
					<Card
						key={item.contractAddr}
						card={item}
						editClickHandler={props.editClickHandler}
						cancelClickHandler={props.cancelClickHandler}
						setContractId={props.setContractId}
					/>
				);
			})}
		</ContractCards>
	);
};

function formatSpeed(speedHps: string) {
	if (speedHps === undefined || speedHps === null) {
		return '…';
	}
	return formatTHPS(speedHps).full;
}

function formatDuration(length: string) {
	return getReadableDate(String(Number(length) / 3600));
}

function formatAddress(address: string) {
	if (address === undefined || address === null) {
		return '…';
	}
	return truncateAddress(address, AddressLength.MEDIUM);
}
