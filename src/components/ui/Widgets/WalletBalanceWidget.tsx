import { LumerinIcon } from '../../../images';
import EastIcon from '@mui/icons-material/East';
import styled from '@emotion/styled';
import { MobileWidget, SmallWidget } from '../Cards/Cards.styled';
import { formatCurrency } from '../../../web3/helpers';
import { Rates } from '../../../rates/interfaces';

export const EtherIcon = ({ size = '4rem', ...props }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		xmlSpace="preserve"
		viewBox="0 0 1920 1920"
		{...props}
		width={size}
	>
		<path fill="#8A92B2" d="M959.8 80.7 420.1 976.3 959.8 731z" />
		<path
			fill="#62688F"
			d="M959.8 731 420.1 976.3l539.7 319.1zm539.8 245.3L959.8 80.7V731z"
		/>
		<path fill="#454A75" d="m959.8 1295.4 539.8-319.1L959.8 731z" />
		<path fill="#8A92B2" d="m420.1 1078.7 539.7 760.6v-441.7z" />
		<path fill="#62688F" d="M959.8 1397.6v441.7l540.1-760.6z" />
	</svg>
);

export const WalletBalanceWidget = (props: { lumerinBalance: number; ethBalance: number; isMobile: boolean, rates: Rates | undefined }) => {
	const WalletBalanceWrapper = styled(SmallWidget)`
		.balance-wrapper {
			width: 100%;
			display: flex;
			justify-content: space-evenly;
			align-items: center;

			.balance {
				font-size: 1.5rem;
				margin-left: 0.65rem;
				color: rgba(14, 67, 83);

				.lmr {
					font-size: 1.125rem;
					line-height: 1.75rem;
				}
			}
		}
	`;

	const MobileWalletBalanceWrapper = styled(MobileWidget)`
		flex-direction: column;
		flex: 40%;
		h3 {
			color: #696969;
			font-size: 10px;
		}
		p {
			font-size: 16px;
			color: rgba(14, 67, 83);
			font-weight: 500;

			.lmr {
				font-size: 10px;
				line-height: 1.75rem;
			}
		}
	`;

	const Rate = styled.p`
		font-size: 0.625rem;
		text-align: center;
		color: #a7a9b6;
	`

	const formattedLmr = formatCurrency({ value: props.lumerinBalance, maxSignificantFractionDigits: 0, currency: undefined });
	const formattedEth = formatCurrency({ value: props.ethBalance, maxSignificantFractionDigits: 4, currency: undefined });

	return (
		<>
			{!props.isMobile ? (
				<WalletBalanceWrapper>
					<h3>Wallet Balance</h3>
					<div className='flex items-center justify-evenly flex-1 balance-wrapper w-100'>
						<div className='flex items-center justify-center flex-col'>
							<div className='flex items-center justify-center'>
								<LumerinIcon />
								<span className='balance'>
									{formattedLmr} <span className='lmr'>LMR</span>
								</span>
							</div>
							{props.rates && <Rate>≈ ${(props.rates?.LMR * props.lumerinBalance).toFixed(2)}</Rate>}
						</div>

						<div className='flex items-center justify-center flex-col'>
							<div className='flex items-center justify-center'>
								<EtherIcon size="28px" />
								<span className='balance' style={{ marginLeft: '0.2rem' }}>
									{formattedEth} <span className='lmr'>ETH</span>
								</span>
							</div>
							{props.rates && <Rate>≈ ${(props.rates?.ETH * props.ethBalance).toFixed(2)}</Rate>}
						</div>
					</div>
					<div className='link'>
						<a href='https://app.uniswap.org/tokens/ethereum/0x4b1d0b9f081468d780ca1d5d79132b64301085d1' target="_blank" rel="noreferrer">
							Buy LMR tokens on Uniswap <EastIcon style={{ fontSize: '0.75rem' }} />
						</a>
					</div>
				</WalletBalanceWrapper>
			) : (
				<MobileWalletBalanceWrapper style={{ width: '100%'}}>
					<h3>Your Balance</h3>
					<div className='flex items-center justify-evenly' style={{ width: '100%'}}>
						<p>
							{formattedLmr}
							<span className='lmr'> LMR</span>
						</p>
						<p>
							{formattedEth}
							<span className='lmr'> ETH</span>
						</p>
					</div>
				</MobileWalletBalanceWrapper>
			)}
		</>
	);
};
