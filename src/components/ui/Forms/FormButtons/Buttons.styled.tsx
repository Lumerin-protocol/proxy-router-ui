import styled from '@emotion/styled';

export const ButtonWrapper = styled.div`
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

export const ButtonsWrapper = styled.div`
	display: flex;
	flex-direction: row;
	& div:not(:last-child) {
		margin-right: 1rem;
	}
`;
