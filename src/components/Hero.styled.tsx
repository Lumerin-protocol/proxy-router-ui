import styled from '@emotion/styled';

export const HeroWrapper = styled.div`
	margin-top: 5rem;
	p {
		font-family: Montserrat;
	}

	h3 {
		color: #004c5f;
		font-size: 2rem;
		font-weight: 600;
		font-family: Raleway;
	}

	.instructions-link {
		color: #004c5f;
	}
`;

export const HeroHeadline = styled.h1`
	font-size: 4rem;
	font-weight: 700;
	color: #004c5f;
	font-family: Raleway;
	line-height: 1.25;
`;

export const HeroSubheadline = styled.div`
	font-size: 1.5rem;
	max-width: 400px;
`;

export const Steps = styled.ul`
	display: flex;
	flex-direction: row;
	margin-top: 2rem;

	.step {
		border-radius: 50%;
		background: #eaf7fc;
		width: 75px;
		height: 75px;
		display: flex;
		justify-content: center;
		align-items: center;
		font-family: Raleway;
		font-weight: 700;
		font-size: 1.5rem;
	}

	p {
		max-width: 50%;
	}
`;
