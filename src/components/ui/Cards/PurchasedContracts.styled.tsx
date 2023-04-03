import styled from '@emotion/styled';

export const ContractCards = styled.div`
	width: 100%;
	margin: 0;
	display: grid;
	gap: 1rem;
	font-family: Inter, sans-serif;

	@media (min-width: 900px) {
		grid-template-columns: repeat(3, 1fr);
	}
	.card {
		background: white;
		border-radius: 15px;
		padding: 1.75rem;
		padding-bottom: 1rem;
		margin-bottom: 1rem;

		.row {
			display: flex;
			flex-direction: row;
			justify-content: space-between;
		}

		.progress {
			display: flex;
			width: 100%;
			align-items: center;
			margin-bottom: 1.5rem;

			.pickaxe {
				background-color: #0f4454;
				display: flex;
				justify-content: center;
				align-items: center;
				width: 75px;
				height: 60px;
				padding: 5px 10px;
				border-radius: 200px;
				margin-right: 1rem;
			}
			.utils {
				display: flex;
				flex-direction: column;
				width: 100%;

				.percentage-and-actions {
					display: flex;
					justify-content: space-between;
					align-items: center;
				}
				h2 {
					font-size: 1.1rem;
					font-weight: 500;
					color: #0f4454;
				}
				a {
					font-weight: 400;
					text-decoration: underline;
				}
			}
		}
		.grid {
			h3,
			.sm-header {
				font-size: 0.65rem;
				color: #384764;
				font-weight: 300;
				margin-bottom: 0.15rem;
			}
			.item-value {
				display: flex;
				flex-direction: row;
				align-items: center;
				img {
					width: 20px;
					height: 20px;
					margin-right: 0.75rem;
				}
				p {
					font-weight: 400;
					font-size: 0.85rem;
					color: #0f4454;
					padding-bottom: 0.8rem;
				}
			}
			.address {
				margin-bottom: 0.5rem;
				a {
					text-decoration: underline;
					font-size: 0.85rem;
					color: #0f4454;
				}
			}
		}
	}
`;
