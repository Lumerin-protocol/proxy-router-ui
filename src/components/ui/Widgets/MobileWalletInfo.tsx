import styled from '@emotion/styled';
import { MobileWidget } from '../Cards/Cards.styled';
import { truncateAddress } from '../../../utils';
import { AddressLength } from '../../../types';

const WalletBalanceWrapper = styled(MobileWidget)`
	flex: 40%;
	h3 {
		color: #696969;
		font-size: 10px;
	}
	p {
		font-size: 16px;
		color: rgba(14, 67, 83);
		font-weight: 500;
	}
`;

export const MobileWalletInfo = (props: { walletAddress?: string; isMobile: boolean }) => {
	const { walletAddress } = props;
	const truncatedAddr = walletAddress ? truncateAddress(walletAddress, AddressLength.MEDIUM) : '…';
	return (
		<WalletBalanceWrapper>
			<h3>Connected Wallet</h3>
			<p>{truncatedAddr}</p>
		</WalletBalanceWrapper>
	);
};
