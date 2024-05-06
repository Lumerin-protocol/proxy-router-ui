import styled from '@emotion/styled';

export const ActionButtonWrapper = styled.div`
	width: 30px;
	margin-left: 0.75rem;
	button {
		border-radius: 50px;
		width: 30px;
		height: 30px;
		border: none;
		background: #e2edfb;
		display: flex;
		justify-content: center;
		align-items: center;
		img {
			width: 0.85rem;
		}
		.cancel {
			width: 1rem;
		}
	}
	p {
		font-family: Inter, sans-serif;
		font-size: 0.65rem;
		text-align: center;
		color: #0f4454;
	}
`;

export const ConnectButtonsWrapper = styled.div`
	display: flex;
	flex-direction: column;

	button {
		background-color: #eaf7fc;
		border-radius: 20px;
		margin-bottom: 2rem;
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 1rem;

		span {
			margin-right: 1rem;
		}
	}
`;

export const FormButtonsWrapper = styled.div`
	display: flex;
	flex-direction: row;
	margin-top: 1.5rem;

	button {
		flex: auto;
	}
	& button:not(:last-child) {
		margin-right: 1rem;
	}
`;

export const Button = styled.button`
	border-radius: 8px;
	padding: 0.5rem 1rem;
	outline: none;
	display: flex;
	flex-direction: row;
	flex-wrap: no-wrap;
	justify-content: center;
	align-items: center;
	font-weight: 500;
	&:not(:last-child) {
		margin-right: 1rem;
	}
	@media (max-width: 410px) {
		font-size: 0.85rem;
		padding: 1rem 1rem;
	}
`;

export const PrimaryButton = styled(Button)`
	color: #fff;
	background-color: #4c5a5f;
`;

export const DisabledButton = styled(Button)`
	color: black;
	background: grey;
	box-shadow: none;
	cursor: not-allowed;
`;

export const SecondaryButton = styled(Button)`
	color: #fff;
	background: none;
	border: 2px solid #fff;
`;

export const CancelButton = styled(Button)`
	color: red;
	border: 2px solid red;
`;
