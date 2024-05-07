import { HashRentalContract, SortTypes } from '../../../types';
import { getReadableDate } from '../../../utils';
import SpeedIcon from '../../../images/icons/speed-icon-white.png';
import PriceIcon from '../../../images/icons/price-icon-white.png';
import TimeIcon from '../../../images/icons/time-icon-white.png';
import {
	AvailableContract,
	MobileAvailableContract,
	SkeletonWrap,
	TableHeader,
	MobileTableHeader,
} from './AvailableContract.styled';
import { Skeleton } from '@mui/material';
import { useEffect, useState } from 'react';
import { SecondaryButton } from '../Forms/FormButtons/Buttons.styled';
import styled from '@emotion/styled';
import { ArrowsUpDownIcon, ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/24/outline';

const HeaderItem = styled.div`
	display: flex;
	gap: 5px;
	flex-direction: row;
	justify-content: center;
	align-items: center;

	p,
	svg {
		:hover {
			cursor: pointer;
		}
	}
`;

export const AvailableContracts = (prop: {
	contracts: Array<HashRentalContract>;
	loading: boolean;
	setSortType: (sortType: string) => void;
	sortType?: string;
}) => {
	const [width, setWidth] = useState<number>(window.innerWidth);
	const [activeSort, setActiveSort] = useState<string>('');
	const [sortState, setSortState] = useState<number>(0);

	function handleWindowSizeChange() {
		setWidth(window.innerWidth);
	}
	useEffect(() => {
		window.addEventListener('resize', handleWindowSizeChange);
		return () => {
			window.removeEventListener('resize', handleWindowSizeChange);
		};
	}, []);

	const TradeButtonsGroup = styled.div`
		display: flex;
		justify-content: space-between;
		flex: 1;
		button {
			width: 100%;
		}
	`;

	useEffect(() => {
		updateSortType();
	}, [sortState, activeSort]);

	const updateSortType = () => {
		if (activeSort === 'speed') {
			if (sortState === 0) {
				prop.setSortType('');
			} else if (sortState === 1) {
				prop.setSortType(SortTypes.SpeedFastToSlow);
			} else if (sortState === 2) {
				prop.setSortType(SortTypes.SpeedSlowToFast);
			}
		}
		if (activeSort === 'length') {
			if (sortState === 0) {
				prop.setSortType('');
			} else if (sortState === 1) {
				prop.setSortType(SortTypes.DurationLongToShort);
			} else if (sortState === 2) {
				prop.setSortType(SortTypes.DurationShortToLong);
			}
		}
		if (activeSort === 'price') {
			if (sortState === 0) {
				prop.setSortType('');
			} else if (sortState === 1) {
				prop.setSortType(SortTypes.PriceHighToLow);
			} else if (sortState === 2) {
				prop.setSortType(SortTypes.PriceLowToHigh);
			}
		}
	};

	const onClickSort = (field: string) => {
		setActiveSort(field);
		if (activeSort === field) {
			setSortState((sortState + 1) % 3);
		} else {
			setSortState(1);
		}
	};

	const getSortFieldIcon = (field: string) => {
		if (!activeSort) {
			return <ArrowsUpDownIcon className='h-4 w-4' />;
		}

		if (activeSort === field) {
			if (sortState === 0) {
				return <ArrowsUpDownIcon className='h-4 w-4' />;
			} else if (sortState === 1) {
				return <ArrowUpIcon className='h-4 w-4' />;
			} else if (sortState === 2) {
				return <ArrowDownIcon className='h-4 w-4' />;
			}
		} else {
			return <ArrowsUpDownIcon className='h-4 w-4' />;
		}
	};

	const getTableHeader = () => {
		const Header = isMobile ? MobileTableHeader : TableHeader;
		return (
			<Header key={'header'}>
				{!isMobile && <p>Address</p>}
				<HeaderItem onClick={() => onClickSort('speed')}>
					<p>Speed</p>
					{getSortFieldIcon('speed')}
				</HeaderItem>
				<HeaderItem onClick={() => onClickSort('length')}>
					<p>Duration</p>
					{getSortFieldIcon('length')}
				</HeaderItem>
				<HeaderItem onClick={() => onClickSort('price')}>
					<p>Price</p>
					{getSortFieldIcon('price')}
				</HeaderItem>
			</Header>
		);
	};

	const isMobile = width <= 768;

	if (prop.loading) {
		return (
			<>
				{[...Array(10)].map((_, index) => (
					<SkeletonWrap key={index}>
						<Skeleton variant='rectangular' width={'100%'} height={100} />
					</SkeletonWrap>
				))}
			</>
		);
	}

	if (prop.contracts.length === 0) {
		return <h2>No contracts available for purchase.</h2>;
	}

	// Mobile view
	if (isMobile) {
		return (
			<ul>
				{getTableHeader()}
				{prop.contracts.map((item, index) => (
					<MobileAvailableContract key={item.contractId as any}>
						<div className='stats'>
							<div>
								<img src={SpeedIcon} alt='' />
								{item.speed} th/s
							</div>
							{item.length && (
								<div>
									<img src={TimeIcon} alt='' />
									{getReadableDate(item.length.toString())}
								</div>
							)}
							<div>
								<img src={PriceIcon} alt='' />
								{item.price} LMR
							</div>
						</div>
						<div className='actions'>
							<TradeButtonsGroup>
								<SecondaryButton>
									<a
										href={`${process.env.REACT_APP_ETHERSCAN_URL}${item.contractId}`}
										target='_blank'
										rel='noreferrer'
									>
										View Contract
									</a>
								</SecondaryButton>
								{item.trade}
							</TradeButtonsGroup>
						</div>
					</MobileAvailableContract>
				))}
			</ul>
		);
	}

	// Desktop view
	return (
		<ul>
			{getTableHeader()}
			{prop.contracts.map((item, index) => (
				<AvailableContract key={item.contractId as any}>
					<p>
						<a
							className='underline pb-0 font-Raleway cursor-pointer'
							href={process.env.REACT_APP_ETHERSCAN_URL + `${item.contractId}`}
							target='_blank'
							rel='noreferrer'
						>
							View Contract
						</a>
					</p>
					<p>
						<img src={SpeedIcon} alt='' />
						{item.speed} th/s
					</p>
					{item.length && (
						<p>
							<img src={TimeIcon} alt='' />
							{getReadableDate(item.length.toString())}
						</p>
					)}
					<p>
						<img src={PriceIcon} alt='' />
						{item.price} LMR
					</p>
					{item.trade}
				</AvailableContract>
			))}
		</ul>
	);
};
