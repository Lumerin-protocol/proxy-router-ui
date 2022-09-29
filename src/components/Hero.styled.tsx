import styled from '@emotion/styled';
import HeroBubble from '../images/hero-bubble-round.png';
import HeroVase from '../images/hero-bubble-vase.png';
import HeroBubbleLines from '../images/hero-bubble-lines.png';

export const HeroWrapper = styled.div`
	min-height: 100vh;
	padding-top: 5rem;
	width: 100%;
	background-image: url(${HeroBubble}), url(${HeroBubbleLines}), url(${HeroVase}),
		radial-gradient(
			circle at 60% -100%,
			#c5e9f7,
			#ceecf8,
			#d6eff9,
			#def2fa,
			#e7f6fc,
			#eff9fd,
			#f7fcfe,
			#ffffff
		);
	background-position: top 375px right 200px, top 500px right 200px, top right, bottom right, top;
	background-size: 80% 80% 80% 80% 100%;
	background-repeat: no-repeat;

	.content-wrapper {
		max-width: 1150px;
		margin: 0 auto;
		padding: 2rem;
	}
	p {
		font-family: Montserrat;
	}

	h3 {
		color: #004c5f;
		font-size: 1.75rem;
		font-weight: 600;
		font-family: Raleway;
		margin-top: 2rem;
	}

	.instructions-link {
		color: #004c5f;
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
	color: #004c5f;
	font-family: Raleway;
	line-height: 1.25;
`;

export const HeroSubheadline = styled.div`
	font-size: 1.5rem;
	max-width: 400px;
	margin-bottom: 1.5rem;
`;

export const Steps = styled.ul`
	display: flex;
	flex-direction: row;
	margin-top: 2rem;
	margin-bottom: 2rem;

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
