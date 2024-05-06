import styled from '@emotion/styled';
// import HeroBubble from '../images/hero-bubble-round.png';
// import HeroVase from '../images/hero-bubble-vase.png';
// import HeroBubbleLines from '../images/hero-bubble-lines.png';
import Background from '../images/connect-wallet-page.png';

export const HeroWrapper = styled.div`
	min-height: 100vh;
	padding-top: 5rem;
	width: 100%;
	background-color: #1e1e1e;

	/* @media (max-width: 650px) {
		background-position: top 414px right 2px, top 500px right 200px, top right -75px, bottom right,
			top;
		background-size: 34%, 50%, 72%, 100%, 100%;
		background-repeat: no-repeat;
	} */

	.content-wrapper {
		max-width: 1150px;
		margin: 0 auto;
		padding: 2rem;
		padding-bottom: 5rem;
	}
	p {
		color: #fff;
		font-family: Montserrat;
	}

	h3 {
		color: #fff;
		font-size: 1.75rem;
		font-weight: 600;
		font-family: Raleway;
		margin-top: 2rem;
		@media (max-width: 650px) {
			font-size: 1.5rem;
		}
	}

	.instructions-link {
		color: #fff;
		font-weight: 600;
		display: flex;
		align-items: center;
	}

	.arrow-icon {
		font-size: 0.95rem;
		margin-left: 0.25rem;
	}
`;

export const HeroHeadline = styled.h1`
	font-size: 4rem;
	font-weight: 700;
	color: #fff;
	font-family: Raleway;
	line-height: 1.25;

	@media (max-width: 450px) {
		font-size: 3rem;
	}
`;

export const HeroSubheadline = styled.div`
	font-size: 1.5rem;
	max-width: 400px;
	margin-bottom: 1.5rem;
	color: #fff;
`;

export const Steps = styled.ul`
	display: flex;
	flex-direction: row;
	margin-top: 2rem;
	margin-bottom: 2rem;

	@media (max-width: 650px) {
		flex-direction: column;
		justify-content: center;
		.step {
			margin-right: 1rem;
			margin-bottom: 0rem;
		}
		li {
			display: flex;
			flex-direction: row;
			margin-bottom: 1rem;
		}
	}

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
		margin-bottom: 1rem;
	}

	p {
		max-width: 50%;
	}
`;
