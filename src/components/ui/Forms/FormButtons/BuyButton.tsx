import React, { Dispatch, SetStateAction } from 'react';
import { PrimaryButton } from './Buttons.styled';

interface BuyButtonProps {
	contractId: string;
	setContractId: (id: string) => void;
	buyClickHandler: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export const BuyButton: React.FC<BuyButtonProps> = ({
	contractId,
	setContractId,
	buyClickHandler,
}) => {
	return (
		<PrimaryButton
			onClick={(event) => {
				setContractId(contractId);
				buyClickHandler(event);
			}}
		>
			Purchase
		</PrimaryButton>
	);
};

BuyButton.displayName = 'BuyButton';
BuyButton.whyDidYouRender = false;
