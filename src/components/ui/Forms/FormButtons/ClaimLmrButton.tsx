import React, { Dispatch, SetStateAction } from 'react';
import { ActionButtonWrapper } from './Buttons.styled';
import ClaimIcon from '../../../../images/icons/money-bag.png';

interface ClaimLmrButtonProps {
	contractId: string;
	setContractId: Dispatch<SetStateAction<string>>;
	claimLmrClickHandler: React.MouseEventHandler<HTMLButtonElement>;
}

export const ClaimLmrButton: React.FC<ClaimLmrButtonProps> = ({
	contractId,
	setContractId,
	claimLmrClickHandler,
}) => {
	const clickHandler: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void = (
		event
	) => {
		setContractId(contractId);
		claimLmrClickHandler(event);
	};

	return (
		<ActionButtonWrapper>
			<button type='button' onClick={(event) => clickHandler(event)}>
				<img src={ClaimIcon} alt='' />
			</button>
			<p>Claim</p>
		</ActionButtonWrapper>
	);
};

ClaimLmrButton.displayName = 'ClaimLmrButton';
ClaimLmrButton.whyDidYouRender = false;
