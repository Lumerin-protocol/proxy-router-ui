import { HashRentalContract } from '../../../types';
import { getReadableDate } from '../../../utils';
import SpeedIcon from '../../../images/icons/download-speed.png';
import PriceIcon from '../../../images/icons/price-tag.png';
import TimeIcon from '../../../images/icons/time-left.png';
import { AvailableContract, SkeletonWrap } from './AvailableContract.styled';
import { Fade, Grow, Skeleton, Slide } from '@mui/material';

export const AvailableContracts = (prop: {
	contracts: Array<HashRentalContract>;
	loading: boolean;
}) => {
	return (
		<>
			{prop.loading ? (
				[...Array(10)].map((elementInArray, index) => (
					<SkeletonWrap>
						<Skeleton variant='rectangular' width={'100%'} height={100} />
					</SkeletonWrap>
				))
			) : (
				<>
					{prop.contracts.length > 0 ? (
						<ul>
							{prop.contracts.map((item, index) => (
								<Grow in={true}>
									<AvailableContract key={index}>
										<p>
											<a
												className='underline pb-0 font-Raleway cursor-pointer'
												href={`https://goerli.etherscan.io/address/${item.contractId}`}
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
												{getReadableDate(item.length)}
											</p>
										)}
										<p>
											<img src={PriceIcon} alt='' />
											{item.price} LMR
										</p>
										{item.trade}
									</AvailableContract>
								</Grow>
							))}
						</ul>
					) : (
						<h2>No contracts available for purchase.</h2>
					)}
				</>
			)}
		</>
	);
};
