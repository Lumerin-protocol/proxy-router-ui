import styled from '@emotion/styled';

export const ContractCards = styled.div`
	width: 100%;
	margin: 0;
	display: grid;
	gap: 1rem;
	font-family: Inter, sans-serif;

	@media (min-width: 900px) {
		grid-template-columns: repeat(2, 1fr);
	}
	@media (min-width: 1800px) {
		grid-template-columns: repeat(3, 1fr);
	}
	.card {
		background: white;
		border-radius: 15px;
		padding: 1.75rem;
		padding-bottom: 3rem;
		margin-bottom: 1rem;
		.utils {
			display: flex;
			flex-direction: row;
			align-items: center;
			justify-content: space-between;
			width: 100%;
			height: 25%;
			a {
				font-weight: 400;
				text-decoration: underline;
			}
			.status {
				display: flex;
				flex-direction: row;
				align-items: center;
				margin-left: 0.25rem;
			}
		}
		.grid {
			display: grid;
			grid-template-columns: 1.5fr repeat(3);
			grid-template-rows: repeat(3, 1fr);
			grid-column-gap: 1rem;
			grid-row-gap: 0px;
			height: 70%;
			.item-value {
				display: flex;
				flex-direction: row;
				align-items: center;
				img {
					width: 20px;
					height: 20px;
					margin-right: 0.75rem;
				}
				h3 {
					font-size: 0.7rem;
					color: #384764;
					font-weight: 300;
				}
				p {
					font-weight: 400;
					font-size: 0.85rem;
					color: #0f4454;
					padding-bottom: 0.8rem;
				}
			}
			.progress {
				grid-area: 1 / 1 / 4 / 2;
				min-width: 70px;
				max-width: 140px;
				display: flex;
				justify-content: center;
			}
			.started {
				grid-area: 1 / 3 / 2 / 4;
			}
			.speed {
				grid-area: 2 / 3 / 3 / 4;
			}
			.duration {
				grid-area: 3 / 3 / 4 / 4;
			}
			.price {
				grid-area: 1 / 4 / 2 / 5;
			}
			.address {
				grid-area: 2 / 4 / 3 / 5;
			}
			.username {
				grid-area: 3 / 4 / 4 / 5;
				word-break: break-all;
			}
		}
	}
`;
