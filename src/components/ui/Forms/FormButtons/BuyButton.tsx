import React, { Dispatch, SetStateAction } from 'react';

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

	return (
		<button
			type='button'
			className='w-16 h-8 sm:w-20 sm:h-10 p-auto rounded-5 bg-lumerin-aqua text-white font-medium'
			onClick={(event) => clickHandler(event)}
		>
			<span>Buy</span>
		</button>
	);
};

BuyButton.displayName = 'BuyButton';
BuyButton.whyDidYouRender = false;
