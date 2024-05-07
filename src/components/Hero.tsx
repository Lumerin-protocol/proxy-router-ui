import { useState } from 'react';
import { HeroWrapper, HeroHeadline, HeroSubheadline, Steps } from './Hero.styled';
import EastIcon from '@mui/icons-material/East';
import { ConnectWalletModal } from './ui/Forms/ConnectWalletModal';
import { PrimaryButton } from './ui/Forms/FormButtons/Buttons.styled';
import { ModalItem } from './ui/Modal';
import styled from '@emotion/styled';
import Prototype from '../images/landing-hero.png';

const ConnectBtn = styled(PrimaryButton)`
	background-color: #4c5a5f;
	background: #4c5a5f
		linear-gradient(45deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0) 100%);
	box-shadow: 0px 4px 10px 0px rgba(0, 0, 0, 0.2);
	color: #fff;
	font-weight: 500;
	padding: 0.75rem 1.75rem;
`;

export const Hero = (prop: { actionButtons: JSX.Element }) => {
	const [connectWalletModalIsOpen, setConnectWalletModalIsOpen] = useState<boolean>(false);

	const openConnectWalletModal = () => {
		setConnectWalletModalIsOpen(true);
	};

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
			<ModalItem
				open={connectWalletModalIsOpen}
				setOpen={setConnectWalletModalIsOpen}
				content={<ConnectWalletModal actionButtons={prop.actionButtons} />}
			/>
			<HeroWrapper>
				<div className='content-wrapper'>
					<div className='hero'>
						<div className='left'>
							<HeroHeadline>
								Lumerin <br />
								Hashpower <br />
								Marketplace
							</HeroHeadline>
							<HeroSubheadline>
								Buy, sell, and own hashpower through your Web3 wallet
							</HeroSubheadline>
							<ConnectBtn type='button' onClick={openConnectWalletModal}>
								Connect Wallet
							</ConnectBtn>
						</div>
						<div className='right'>
							<img src={Prototype} alt='prototype screenshot' />
						</div>
					</div>
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
						href={process.env.REACT_APP_GITBOOK_URL}
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
