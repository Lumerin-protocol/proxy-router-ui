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
			className='px-4 py-2 rounded-10 bg-lumerin-dark-blue max-w-3/4 text-white text-xs'
			onClick={(event) => clickHandler(event)}
		>
			Purchase
		</button>
	);
};

BuyButton.displayName = 'BuyButton';
BuyButton.whyDidYouRender = false;
