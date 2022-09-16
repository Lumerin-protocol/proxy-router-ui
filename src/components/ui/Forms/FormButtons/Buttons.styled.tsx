import styled from '@emotion/styled';

export const ActionButtonWrapper = styled.div`
	width: 35px;
	button {
		border-radius: 50px;
		width: 35px;
		height: 35px;
		border: none;
		background: #e2edfb;
		display: flex;
		justify-content: center;
		align-items: center;
		img {
			width: 15px;
		}
	}
	p {
		font-family: Inter, sans-serif;
		font-size: 0.7rem;
		text-align: center;
		color: #0f4454;
	}
`;

export const FormButtonsWrapper = styled.div`
	display: flex;
	flex-direction: row;
	margin-top: 2rem;

	button {
		flex: auto;
	}
	& button:not(:last-child) {
		margin-right: 1rem;
	}
`;

export const Button = styled.button`
	border-radius: 85px;
	padding: 1.5rem 2rem;
	outline: none;
`;

export const PrimaryButton = styled(Button)`
	color: white;
	background: #014353;
`;

export const SecondaryButton = styled(Button)`
	color: #014353;
	background: none;
	border: 2px solid #014353;
`;
