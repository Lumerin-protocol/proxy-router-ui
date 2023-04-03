import styled from '@emotion/styled';

export const Card = styled.div`
	padding: 1.5rem;
	background-color: white;
	border-radius: 15px;
	display: flex;
	justify-content: center;
	align-items: center;
	min-height: 8rem;
	flex: 1 1 auto;
`;

export const SmallWidget = styled(Card)`
	padding: 0.5rem 1.25rem;
	margin-bottom: 0.75rem;
	border-radius: 15px;
	display: flex;
	flex-direction: column;
	justify-content: center;
	min-width: 215px;

	h3 {
		text-align: center;
		font-size: 0.75rem;
	}

	.link {
		padding-top: 0.375rem;
		text-align: center;
		border-top-width: 2px;
		font-size: 0.65rem;
		border-top: 2px solid rgba(234, 247, 252);
	}
`;

export const MobileWidget = styled.div`
	padding: 0.5rem;
	background-color: white;
	border-radius: 15px;
	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: column;
`;
