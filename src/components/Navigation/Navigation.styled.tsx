import styled from '@emotion/styled';

export const DrawerContent = styled.div`
	height: 100vh;
	width: 100%;
	padding: 2rem;
	display: flex;
	flex-direction: column;
	justify-content: space-between;

	nav a,
	.resources a {
		display: flex;
		padding: 0.5rem;
		align-items: center;
	}

	.item-name {
		margin-left: 1rem;
		font-size: 0.925rem;
		line-height: 1.25rem;
		font-weight: 500;
	}

	.version {
		font-size: 0.5rem;
		padding: 0.5rem;
	}

	.menu-icon {
		margin-bottom: 2.5rem;
		width: 136px;
	}

	img {
		width: 20px;
		margin: 0.5rem 0;
	}

	.resources {
		padding: 1rem 0;
		border-top: 2px solid #f4f4f4;

		h3 {
			color: #0e4353;
			margin-bottom: 1rem;
			font-weight: 500;
			padding-left: 0.5rem;
		}

		a {
			margin-bottom: 0.5rem;
		}
	}
`;
