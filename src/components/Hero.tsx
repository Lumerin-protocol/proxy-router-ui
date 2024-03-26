import { useState } from 'react';
import { HeroWrapper, HeroHeadline, HeroSubheadline, Steps } from './Hero.styled';
import EastIcon from '@mui/icons-material/East';
import { ConnectWalletModal } from './ui/Forms/ConnectWalletModal';
import { PrimaryButton } from './ui/Forms/FormButtons/Buttons.styled';
import { ModalItem } from './ui/Modal';
import styled from '@emotion/styled';

const ConnectBtn = styled(PrimaryButton)`
	backgroundcolor: rgb(255, 184, 0);
	background: linear-gradient(0deg, rgba(255, 184, 0, 1) 0%, rgba(230, 139, 3, 1) 100%);
	boxshadow: 0px 4px 10px 0px rgba(0, 0, 0, 0.2);
	color: black;
	font-weight: 600;
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
					<HeroHeadline>
						Lumerin <br />
						Hashpower <br />
						Marketplace
					</HeroHeadline>
					<HeroSubheadline>Buy, sell, and own hashpower through your Web3 wallet</HeroSubheadline>
					<ConnectBtn type='button' onClick={openConnectWalletModal}>
						Connect Wallet
					</ConnectBtn>
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
