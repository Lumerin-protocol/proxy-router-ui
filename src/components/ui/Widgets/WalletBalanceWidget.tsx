import { ArbitrumLogo, EtherIcon, LumerinIcon, UsdcIcon } from '../../../images';
import EastIcon from '@mui/icons-material/East';
import styled from '@emotion/styled';
import { MobileWidget, SmallWidget } from '../Cards/Cards.styled';
import { formatCurrency } from '../../../web3/helpers';
import { Rates } from '../../../rates/interfaces';

type WalletBalanceWidgetProps = {
	tokens: {
		name: string;
		balance: number;
		rateUSD: number;
		icon: React.ReactNode;
	}[];
};

export const WalletBalanceWidget = (props: {
	lumerinBalance: number;
	ethBalance: number;
	usdcBalance: number;
	isMobile: boolean;
	rates: Rates | undefined;
}) => {
	return (
		<>
			<WalletBalanceWidget2
				tokens={[
					{
						name: 'USDC',
						balance: props.usdcBalance,
						rateUSD: 1,
						icon: <UsdcIcon style={{ width: '25px' }} />,
					},
					{
						name: 'LMR',
						balance: props.lumerinBalance,
						rateUSD: props.rates?.LMR!,
						icon: <LumerinIcon />,
					},
					{
						name: 'ETH',
						balance: props.ethBalance,
						rateUSD: props.rates?.ETH!,
						icon: <EtherIcon style={{ width: '28px' }} />,
					},
				]}
			/>
		</>
	);
};

export const WalletBalanceWidget2 = (props: WalletBalanceWidgetProps) => {
	return (
		<>
			<WalletBalanceWrapper>
				<h3>
					<ArbitrumLogo style={{ width: '15px', display: 'inline', marginTop: '-3px' }} /> Wallet
					Balance (Arbitrum)
				</h3>
				<div className='flex items-center justify-evenly flex-1 balance-wrapper w-100 flex-col lg:flex-row '>
					{props.tokens.map((token) => (
						<div className='flex items-center justify-center flex-col'>
							<div className='flex items-center justify-center'>
								{token.icon}
								<span className='balance'>
									{formatCurrency({
										value: token.balance,
										maxSignificantFractionDigits: 4,
										currency: undefined,
									})}
									<span className='symbol'>{token.name}</span>
								</span>
							</div>
							<div className='items-center justify-center hidden'>
								{token.rateUSD && <Rate>≈ ${(token.rateUSD * token.balance).toFixed(2)}</Rate>}
							</div>
						</div>
					))}
				</div>
				<div className='link'>
					<a href={process.env.REACT_APP_BUY_LMR_URL} target='_blank' rel='noreferrer'>
						Buy LMR tokens on Uniswap <EastIcon style={{ fontSize: '0.75rem' }} />
					</a>
				</div>
			</WalletBalanceWrapper>
		</>
	);
};

const WalletBalanceWrapper = styled(SmallWidget)`
	.balance-wrapper {
		width: 100%;
		display: flex;
		justify-content: space-evenly;
		align-items: center;

		.balance {
			font-size: 1.5rem;
			margin-left: 0.65rem;
			color: #fff;

			.symbol {
				font-size: 1.125rem;
				line-height: 1.75rem;
				margin-left: 0.3rem;
			}
		}

		@media (max-width: 768px) {
			flex-direction: column;
			flex: 40%;
			h3 {
				color: #696969;
				font-size: 10px;
			}
			p {
				font-size: 16px;
				color: #fff;
				font-weight: 500;
			}
			.balance {
				font-size: 1rem;
				margin-left: 0.65rem;
				color: #fff;

				.symbol {
					font-size: 0.8rem;
					line-height: 1.75rem;
				}
			}
		}
	}
`;

const Rate = styled.p`
	font-size: 0.625rem;
	text-align: center;
	color: #a7a9b6;
`;
