import React, { Dispatch, SetStateAction } from 'react';
import { ActionButtonWrapper } from './Buttons.styled';
import CancelIcon from '../../../../images/icons/cancel.png';

interface CancelButtonProps {
	contractId: string;
	setContractId: Dispatch<SetStateAction<string>>;
	cancelClickHandler: React.MouseEventHandler<HTMLButtonElement>;
}

export const CancelButton: React.FC<CancelButtonProps> = ({
	contractId,
	setContractId,
	cancelClickHandler,
}) => {
	const clickHandler: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void = (
		event
	) => {
		setContractId(contractId);
		cancelClickHandler(event);
	};

	return (
		<ActionButtonWrapper>
			<button type='button' onClick={(event) => clickHandler(event)}>
				<img className='cancel' src={CancelIcon} alt='' />
			</button>
			<p className='text-white'>Cancel</p>
		</ActionButtonWrapper>
	);
};

CancelButton.displayName = 'CancelButton';
CancelButton.whyDidYouRender = false;
