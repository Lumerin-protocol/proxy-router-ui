import styled from '@emotion/styled';

export const ModalBox = styled.div`
	padding: 40px;
	max-width: 450px;
	text-align: left;
	display: flex;
	justify-content: center;
	align-items: center;
`;

export const NetworkBox = styled(ModalBox)`
	max-width: 400px;
	display: block;
	padding: 80px 40px;
	h3 {
		font-size: 1.75rem;
		font-weight: 600;
		margin-bottom: 1rem;
	}

	p {
		margin-bottom: 2rem;
	}
`;

export const ModalCard = styled.div`
	background: white;
	border-radius: 20px;
	display: flex;
	flex-direction: column;
	margin: auto;
	margin-top: 3rem;
	margin-bottom: 3rem;
	max-width: 600px;
	padding: 4rem;
	padding-top: 2rem;

	@media (max-width: 600px) {
		padding: 2rem;
		padding-top: 1rem;
		margin-top: 1rem;
		p {
			font-size: 0.9rem;
		}
	}

	.close {
		margin-left: auto;
	}

	h2 {
		font-size: 2rem;
		font-weight: 500;
		padding-bottom: 1rem;
		@media (max-width: 600px) {
			font-size: 1.5rem;
		}
	}

	.subtext {
		font-size: 0.8rem;
	}

	@media (max-width: 500px) {
		max-width: 90%;
	}
`;

export const ContractLink = styled.a`
	font-size: 0.8rem;
	margin-bottom: 1rem;
	color: #014353;
	font-weight: 500;
`;
