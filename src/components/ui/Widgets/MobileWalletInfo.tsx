import styled from '@emotion/styled';
import { MobileWidget } from '../Cards/Cards.styled';
import { truncateAddress } from '../../../utils';
import { AddressLength } from '../../../types';

export const MobileWalletInfo = (props: { walletAddress: string; isMobile: boolean }) => {
	const WalletBalanceWrapper = styled(MobileWidget)`
		flex: 40%;
		h3 {
			color: #fff;
			font-size: 10px;
		}
		p {
			font-size: 16px;
			color: #fff;
			font-weight: 500;
		}
	`;
	return (
		<WalletBalanceWrapper>
			<h3>Connected Wallet</h3>
			<p>{truncateAddress(props.walletAddress, AddressLength.MEDIUM)}</p>
		</WalletBalanceWrapper>
	);
};
