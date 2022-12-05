import React, { Dispatch, SetStateAction } from 'react';
import { PrimaryButton } from './Buttons.styled';

interface BuyButtonProps {
	contractId: string;
	setContractId: Dispatch<SetStateAction<string>>;
	buyClickHandler: React.MouseEventHandler<HTMLButtonElement>;
}

export const BuyButton: React.FC<BuyButtonProps> = ({
	contractId,
	setContractId,
	buyClickHandler,
}) => {
	const clickHandler: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void = (
		event
	) => {
		setContractId(contractId);
		buyClickHandler(event);
	};

	return <PrimaryButton onClick={(event) => clickHandler(event)}>Purchase</PrimaryButton>;
};

BuyButton.displayName = 'BuyButton';
BuyButton.whyDidYouRender = false;
