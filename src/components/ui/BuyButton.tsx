import React, { Dispatch, SetStateAction } from 'react';

interface BuyButtonProps {
	contractId: string;
	setContractId: Dispatch<SetStateAction<string>>;
	buyClickHandler: React.MouseEventHandler<HTMLButtonElement>;
}

export const BuyButton: React.FC<BuyButtonProps> = ({ contractId, setContractId, buyClickHandler }) => {
	const clickHandler: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void = (event) => {
		setContractId(contractId);
		buyClickHandler(event);
	};

	return (
		<button type='button' className='w-20 h-8 rounded-5 p-auto bg-lumerin-aqua text-white font-medium' onClick={(event) => clickHandler(event)}>
			<span>Buy</span>
		</button>
	);
};

BuyButton.displayName = 'BuyButton';
BuyButton.whyDidYouRender = false;
