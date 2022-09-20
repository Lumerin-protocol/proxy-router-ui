import styled from '@emotion/styled';

export const ModalBox = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	min-height: 100vh;
`;

export const ModalCard = styled.div`
	background: white;
	border-radius: 20px;
	display: flex;
	flex-direction: column;
	margin: auto;
	margin-top: 3rem;
	max-width: 600px;
	padding: 4rem;
	padding-top: 2rem;

	.close {
		margin-left: auto;
	}

	h2 {
		font-size: 2rem;
		font-weight: 500;
		padding-bottom: 1rem;
	}

	.order-ID {
		font-size: 0.8rem;
		margin-bottom: 0.5rem;
		color: #014353;
	}

	.subtext {
		font-size: 0.8rem;
	}

	@media (max-width: 500px) {
		max-width: 90%;
	}
`;
