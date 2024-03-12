import { ArbitrumLogo, EtherIcon, LumerinIcon } from '../../../images';
import EastIcon from '@mui/icons-material/East';
import styled from '@emotion/styled';
import { MobileWidget, SmallWidget } from '../Cards/Cards.styled';
import { formatCurrency } from '../../../web3/helpers';
import { Rates } from '../../../rates/interfaces';

export const WalletBalanceWidget = (props: {
	lumerinBalance: number;
	ethBalance: number;
	isMobile: boolean;
	rates: Rates | undefined;
}) => {
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
	`;

	const formattedLmr = formatCurrency({
		value: props.lumerinBalance,
		maxSignificantFractionDigits: 0,
		currency: undefined,
	});
	const formattedEth = formatCurrency({
		value: props.ethBalance,
		maxSignificantFractionDigits: 4,
		currency: undefined,
	});

	return (
		<>
			{!props.isMobile ? (
				<WalletBalanceWrapper>
					<h3>
						<ArbitrumLogo style={{ width: '15px', display: 'inline', marginTop: '-3px' }} /> Wallet
						Balance
					</h3>
					<div className='flex items-center justify-evenly flex-1 balance-wrapper w-100'>
						<div className='flex items-center justify-center flex-col'>
							<div className='flex items-center justify-center'>
								<LumerinIcon />
								<span className='balance'>
									{formattedLmr} <span className='lmr'>LMR</span>
								</span>
							</div>
							{props.rates && (
								<Rate>≈ ${(props.rates?.LMR * props.lumerinBalance).toFixed(2)}</Rate>
							)}
						</div>

						<div className='flex items-center justify-center flex-col'>
							<div className='flex items-center justify-center'>
								<EtherIcon style={{ width: '28px' }} />
								<span className='balance' style={{ marginLeft: '0.2rem' }}>
									{formattedEth} <span className='lmr'>ETH</span>
								</span>
							</div>
							{props.rates && <Rate>≈ ${(props.rates?.ETH * props.ethBalance).toFixed(2)}</Rate>}
						</div>
					</div>
					<div className='link'>
						<a
							href={process.env.REACT_APP_BUY_LMR_URL}
							target='_blank'
							rel='noreferrer'
						>
							Buy LMR tokens on Uniswap <EastIcon style={{ fontSize: '0.75rem' }} />
						</a>
					</div>
				</WalletBalanceWrapper>
			) : (
				<MobileWalletBalanceWrapper style={{ width: '100%' }}>
					<h3>Your Balance</h3>
					<div className='flex items-center justify-evenly' style={{ width: '100%' }}>
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
