import React, { Dispatch, SetStateAction } from 'react';

interface ClaimLmrButtonProps {
	contractId: string;
	setContractId: Dispatch<SetStateAction<string>>;
	claimLmrClickHandler: React.MouseEventHandler<HTMLButtonElement>;
}

export const ClaimLmrButton: React.FC<ClaimLmrButtonProps> = ({ contractId, setContractId, claimLmrClickHandler }) => {
	const clickHandler: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void = (event) => {
		setContractId(contractId);
		claimLmrClickHandler(event);
	};

	return (
		<button
			type='button'
			className='-ml-px inline-flex items-center w-20 h-8 px-4 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50'
			onClick={(event) => clickHandler(event)}
		>
			<span>Claim</span>
		</button>
	);
};

ClaimLmrButton.displayName = 'ClaimLmrButton';
ClaimLmrButton.whyDidYouRender = false;
