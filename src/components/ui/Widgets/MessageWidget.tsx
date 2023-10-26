import styled from '@emotion/styled';
import { Card, MobileWidget } from '../Cards/Cards.styled';

export const MessageWidget = (props: { isMobile: boolean }) => {
	const MessageWrapper = styled(Card)`
		min-width: 250px;
		max-width: 45%;
		padding: 1rem;
		height: 8rem;
		p {
			font-size: 16px;
		}
		a {
			text-decoration: underline;
		}
	`;

	const MobileMessageWrapper = styled(MobileWidget)`
		width: 100%;
		padding: 18px;
		margin-bottom: 1rem;
		p {
			font-size: 14px;
		}
		a {
			text-decoration: underline;
		}
	`;

	const Content = () => {
		return (
			<p>
				Welcome to the Lumerin Marketplace Beta, please provide feedback or submit any bugs you
				notice to the{' '}
				<a href='https://github.com/Lumerin-protocol/proxy-router-ui/issues'>Github Repo.</a>
			</p>
		);
	};

	return (
		<>
			{props.isMobile ? (
				<MobileMessageWrapper>
					<Content />
				</MobileMessageWrapper>
			) : (
				<MessageWrapper>
					<Content />
				</MessageWrapper>
			)}
		</>
	);
};