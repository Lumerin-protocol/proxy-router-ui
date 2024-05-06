import styled from '@emotion/styled';

export const TableHeader = styled.li`
	background-color: rgba(79, 126, 145, 0.04);
	background: radial-gradient(circle, rgba(0, 0, 0, 0) 36%, rgba(255, 255, 255, 0.05) 100%);
	border: rgba(171, 171, 171, 1) 1px solid;
	border-radius: 15px;
	margin-bottom: 1rem;
	padding-left: 2rem;
	width: 100%;
	height: 50px;
	display: grid;
	grid-template-columns: repeat(5, 1fr);
	grid-template-rows: 1fr;
	grid-column-gap: 0px;
	grid-row-gap: 0px;
	color: white;

	p {
		display: flex;
		flex-direction: row;
		justify-content: center;
		align-items: center;
	}

	img {
		margin-right: 1rem;
		width: 20px;
	}
`;

export const MobileTableHeader = styled(TableHeader)`
	grid-template-columns: repeat(3, 1fr);
`;

export const AvailableContract = styled.li`
	background-color: rgba(79, 126, 145, 0.04);
	background: radial-gradient(circle, rgba(0, 0, 0, 0) 36%, rgba(255, 255, 255, 0.05) 100%);
	border: rgba(171, 171, 171, 1) 1px solid;
	border-radius: 15px;
	color: white;
	margin-bottom: 1rem;
	padding: 2rem;
	width: 100%;
	height: 100px;
	display: grid;
	grid-template-columns: repeat(5, 1fr);
	grid-template-rows: 1fr;
	grid-column-gap: 0px;
	grid-row-gap: 0px;

	p {
		display: flex;
		flex-direction: row;
		justify-content: center;
		align-items: center;

		img {
			margin-right: 1rem;
			width: 20px;
		}
	}
`;

export const MobileAvailableContract = styled.div`
	background: white;
	border-radius: 15px;
	margin-bottom: 1rem;
	padding: 1.5rem;
	width: 100%;
	min-height: 100px;
	display: flex;
	flex-direction: column;
	gap: 0.75rem;

	.stats {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		margin-bottom: 0.5rem;
		div {
			display: flex;
			flex-direction: row;
			align-items: center;
			img {
				height: 17px;
				margin-right: 5px;
				width: auto;
			}
		}
	}

	.actions {
		display: flex;
		flex-direction: row;
	}
`;

export const SkeletonWrap = styled.div`
	& span {
		border-radius: 15px;
		margin-bottom: 1rem;
	}
`;
