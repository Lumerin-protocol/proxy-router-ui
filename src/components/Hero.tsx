import { HeroWrapper, HeroHeadline, HeroSubheadline, Steps } from './Hero.styled';

export const Hero = (prop: { actionButtons: JSX.Element }) => {
	const instructions = [
		{
			step: 1,
			text: 'Purchase Lumerin Tokens (LMR)',
		},
		{
			step: 2,
			text: 'Sign up for a mining pool account',
		},
		{
			step: 3,
			text: 'Connect your Web3 Wallet',
		},
		{
			step: 4,
			text: 'Purchase hashrate and point it at your mining pool account',
		},
	];

	return (
		<HeroWrapper>
			<HeroHeadline>
				Lumerin <br />
				Hashpower <br />
				Marketplace
			</HeroHeadline>
			<HeroSubheadline>Buy, sell, and own hashpower through your Web3 wallet</HeroSubheadline>
			<div>{prop.actionButtons}</div>
			<h3>Easiest way to start mining Bitcoin, without hardware</h3>
			<Steps>
				{instructions.map((item) => (
					<li key={item.step}>
						<div className='step'>{item.step}</div>
						<p>{item.text}</p>
					</li>
				))}
			</Steps>
			<a className='instructions-link' href='#' target='_blank'>
				View Detailed Instuctions
			</a>
		</HeroWrapper>
	);
};
