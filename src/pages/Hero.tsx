import { useState } from 'react';
import { HeroWrapper, HeroHeadline, HeroSubheadline, Steps } from './Hero.styled';
import EastIcon from '@mui/icons-material/East';
import { PrimaryButton } from '../components/ui/Forms/FormButtons/Buttons.styled';
import { useWeb3Modal } from '@web3modal/wagmi/react';

export const Hero = () => {
	const { open } = useWeb3Modal();

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
		<>
			<HeroWrapper>
				<div className='content-wrapper'>
					<HeroHeadline>
						Lumerin <br />
						Hashpower <br />
						Marketplace
					</HeroHeadline>
					<HeroSubheadline>Buy, sell, and own hashpower through your Web3 wallet</HeroSubheadline>
					<PrimaryButton type='button' onClick={() => open()}>
						Connect Wallet
					</PrimaryButton>
					<h3>Easiest way to start mining Bitcoin, without hardware</h3>
					<Steps>
						{instructions.map((item) => (
							<li key={item.step}>
								<div className='step'>{item.step}</div>
								<p>{item.text}</p>
							</li>
						))}
					</Steps>
					<a
						className='instructions-link'
						href='https://app.gitbook.com/o/LyHwPIWryy8bgL99GNF6/s/LOJKfuh83H9XvKG0vaoH/'
						target='_blank'
						rel='noreferrer'
					>
						View Detailed Instuctions <EastIcon className='arrow-icon' />
					</a>
				</div>
			</HeroWrapper>
		</>
	);
};
