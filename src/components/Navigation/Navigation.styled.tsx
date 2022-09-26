import styled from '@emotion/styled';

export const Sidebar = styled.div`
	background: white;
	height: 100vh;
	width: 100%;
	padding: 2rem;
	display: flex;
	flex-direction: column;
	justify-content: space-between;

	nav a {
		display: flex;
		padding: 0.5rem;
		font-size: 1rem;
		line-height: 1.25rem;
		font-weight: 500;
		align-items: center;
		border-radius: 0.375rem;
	}

	.item-name {
		margin-left: 1rem;
	}

	.mobile-icon {
		margin-bottom: 2rem;
		margin-left: 0.5rem;
	}

	img {
		width: 20px;
		margin: 0.5rem 0;
	}
`;
