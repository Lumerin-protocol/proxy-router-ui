import { LumerinIcon } from '../../../images';
import EastIcon from '@mui/icons-material/East';
import styled from '@emotion/styled';
import { SmallWidget } from '../Cards/Cards.styled';

export const WalletBalanceWidget = (props: { lumerinBalance: number }) => {
	const WalletBalanceWrapper = styled(SmallWidget)`
		.balance-wrapper {
			display: flex;
			justify-content: center;
			align-items: center;

			.balance {
				font-size: 1.85rem;
				margin-left: 0.65rem;
				color: rgba(14, 67, 83);

				.lmr {
					font-size: 1.125rem;
					line-height: 1.75rem;
				}
			}
		}
	`;
	return (
		<WalletBalanceWrapper>
			<h3>Wallet Balance</h3>
			<div className='flex items-center justify-center flex-1 balance-wrapper'>
				<LumerinIcon />
				<span className='balance'>
					{Math.ceil(props.lumerinBalance).toLocaleString()} <span className='lmr'>LMR</span>
				</span>
			</div>
			<div className='link'>
				<a href='/buyerhub'>
					Buy LMR tokens on Uniswap <EastIcon style={{ fontSize: '0.75rem' }} />
				</a>
			</div>
		</WalletBalanceWrapper>
	);
};
