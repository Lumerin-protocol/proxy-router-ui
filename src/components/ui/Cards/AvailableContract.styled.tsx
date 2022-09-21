import styled from '@emotion/styled';

export const AvailableContract = styled.li`
	background: white;
	border-radius: 15px;
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

export const SkeletonWrap = styled.div`
	& span {
		border-radius: 15px;
		margin-bottom: 1rem;
	}
`;
