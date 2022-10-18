import styled from '@emotion/styled';

export const ConnectWalletModal = (prop: { actionButtons: JSX.Element }): JSX.Element => {
	const Header = styled.h2`
		font-size: 1.75rem;
		font-weight: 600;
		margin-bottom: 1rem;
	`;
	return (
		<>
			<Header>Connect a wallet</Header>
			{prop.actionButtons}
		</>
	);
};

ConnectWalletModal.displayName = 'ConnectWalletModal';
ConnectWalletModal.whyDidYouRender = false;
