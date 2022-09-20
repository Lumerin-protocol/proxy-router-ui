import styled from '@emotion/styled';

export const FormWrapper = styled.div`
	background: white;
	border-radius: 20px;
	display: flex;
	flex-direction: column;
	margin: auto;
	margin-top: 3rem;
	max-width: 600px;
	padding: 4rem;

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

export const InputWrapper = styled.div`
	margin-top: 0.75rem;
	margin-bottom: 0.75rem;
	label {
		font-size: 0.75rem;
	}
	input {
		background: #eaf7fc;
		border-radius: 15px;
		padding: 1rem 1.5rem;
		margin-top: 0.25rem;

		::placeholder {
			color: rgba(1, 67, 83, 0.56);
		}
	}
`;

export const ReviewItems = styled.div`
	div {
		display: flex;
		justify-content: space-between;
		margin: 1.25rem 0;
		padding-bottom: 1rem;
		border-bottom: 1px solid #eaf7fc;
		&:last-child {
			border-bottom: none;
		}

		h3 {
			font-size: 0.75rem;
		}

		p {
			color: #014353;
			font-weight: 500;
		}
	}

	.total-cost {
		margin-top: 1rem;
		display: flex;
		flex-direction: column;
		.price {
			font-size: 2rem;
		}
	}
`;
