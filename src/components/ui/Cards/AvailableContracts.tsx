import { HashRentalContract } from '../../../types';
import { getReadableDate } from '../../../utils';
import SpeedIcon from '../../../images/icons/download-speed.png';
import PriceIcon from '../../../images/icons/price-tag.png';
import TimeIcon from '../../../images/icons/time-left.png';
import {
	AvailableContract,
	MobileAvailableContract,
	SkeletonWrap,
} from './AvailableContract.styled';
import { Skeleton } from '@mui/material';
import { useEffect, useState } from 'react';
import { SecondaryButton } from '../Forms/FormButtons/Buttons.styled';
import styled from '@emotion/styled';

export const AvailableContracts = (prop: {
	contracts: Array<HashRentalContract>;
	loading: boolean;
}) => {
	const [width, setWidth] = useState<number>(window.innerWidth);

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
	console.log('contracts: ', prop.contracts);
	const isMobile = width <= 768;
	return (
		<>
			{prop.loading ? (
				[...Array(10)].map((elementInArray, index) => (
					<SkeletonWrap>
						<Skeleton variant='rectangular' width={'100%'} height={100} key={index} />
					</SkeletonWrap>
				))
			) : (
				<>
					{prop.contracts.length > 0 ? (
						<ul>
							{isMobile ? (
								<>
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
								</>
							) : (
								<>
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
								</>
							)}
						</ul>
					) : (
						<h2>No contracts available for purchase.</h2>
					)}
				</>
			)}
		</>
	);
};
