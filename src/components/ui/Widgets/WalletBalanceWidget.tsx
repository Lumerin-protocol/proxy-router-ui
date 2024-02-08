import { LumerinIcon } from '../../../images';
import EastIcon from '@mui/icons-material/East';
import styled from '@emotion/styled';
import { MobileWidget, SmallWidget } from '../Cards/Cards.styled';

export const WalletBalanceWidget = (props: { lumerinBalance: number; isMobile: boolean }) => {
	const WalletBalanceWrapper = styled(SmallWidget)`
		flex: 20%;
		.balance-wrapper {
			display: flex;
			justify-content: center;
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
	return (
		<>
			{!props.isMobile ? (
				<WalletBalanceWrapper>
					<h3>Wallet Balance</h3>
					<div className='flex items-center justify-center flex-1 balance-wrapper'>
						<LumerinIcon />
						<span className='balance'>
							{Math.ceil(props.lumerinBalance).toLocaleString()} <span className='lmr'>LMR</span>
						</span>
					</div>
					<div className='link'>
						<a href='https://app.uniswap.org/tokens/ethereum/0x4b1d0b9f081468d780ca1d5d79132b64301085d1'>
							Buy LMR tokens on Uniswap <EastIcon style={{ fontSize: '0.75rem' }} />
						</a>
					</div>
				</WalletBalanceWrapper>
			) : (
				<MobileWalletBalanceWrapper>
					<h3>Your Balance</h3>
					<p>
						{props.lumerinBalance}
						<span className='lmr'> LMR</span>
					</p>
				</MobileWalletBalanceWrapper>
			)}
		</>
	);
};
