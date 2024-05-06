import { HashRentalContract } from '../../../types';
import styled from '@emotion/styled';
import { SmallWidget } from '../Cards/Cards.styled';
import { Skeleton } from '@mui/material';

export const MarketplaceStatistics = (props: {
	contracts: Array<HashRentalContract>;
	isLoading: boolean;
}) => {
	const activeContracts = props.contracts.filter(
		(contract: HashRentalContract) => !contract.isDeleted
	);

	const getContractEndTimestamp = (contract: any) => {
		if (+contract.timestamp === 0) {
			return 0;
		}
		return (+contract.timestamp + +contract.length) * 1000; // in ms
	};

	const stats = {
		count: activeContracts.length ?? 0,
		rented: activeContracts?.filter((x) => Number(x.state) === 1)?.length ?? 0,
		expiresInHour:
			activeContracts?.filter((c) => {
				const endDate = getContractEndTimestamp(c);
				const utcNow = new Date();
				const limit = utcNow.setHours(utcNow.getHours() + 1);
				return endDate > Date.now() && endDate < limit;
			})?.length ?? 0,
	};

	const MarketplaceStatisticsWrapper = styled(SmallWidget)`
		.stats {
			display: flex;
			justify-content: space-between;
			width: 80%;
			padding: 0.75rem;
		}

		.active {
			color: #fff;
		}
		.completed {
			color: #a7a9b6;
		}

		.stat {
			margin: 0 10px;
			h4 {
				font-size: 1.85rem;
				line-height: 1.75rem;
				text-align: center;
				flex: 1 1 0%;
				margin-bottom: 0.15rem;
				display: flex;
				justify-content: center;
			}
			p {
				font-size: 0.625rem;
				text-align: center;
			}
		}

		.link {
			width: 75%;
			cursor: default;

			span {
				opacity: 0;
			}
		}
	`;

	return (
		<MarketplaceStatisticsWrapper>
			<h3>Marketplace Contracts</h3>
			<div className='stats'>
				<div className='stat active'>
					<h4>
						{props.isLoading ? (
							<Skeleton variant='rectangular' width={40} height={28} />
						) : (
							stats.count
						)}
					</h4>
					<p>TOTAL</p>
				</div>
				<div className='stat active'>
					<h4>
						{props.isLoading ? (
							<Skeleton variant='rectangular' width={40} height={28} />
						) : (
							stats.rented
						)}
					</h4>
					<p>RENTED</p>
				</div>
				<div className='stat active'>
					<h4>
						{props.isLoading ? (
							<Skeleton variant='rectangular' width={40} height={28} />
						) : (
							stats.expiresInHour
						)}
					</h4>
					<p>EXPIRES SOON</p>
				</div>
			</div>
			<div className='link'>
				<span>.</span>
			</div>
		</MarketplaceStatisticsWrapper>
	);
};
