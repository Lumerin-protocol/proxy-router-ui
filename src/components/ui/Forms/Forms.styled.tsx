import styled from '@emotion/styled';

export const InputWrapper = styled.div`
	margin-bottom: 0.75rem;
	@media (max-width: 600px) {
		margin-top: 0;
	}
	label {
		font-size: 0.75rem;
	}
	input {
		background: #eaf7fc;
		border-radius: 12px;
		padding: 12px 1.5rem;
		margin-top: 0.25rem;
		color: #000;

		::placeholder {
			color: grey;
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
			color: #fff;
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
