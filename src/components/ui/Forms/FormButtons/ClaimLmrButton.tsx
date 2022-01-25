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
			className='btn-edit-cancel rounded-5 border border-gray-300 bg-white font-medium text-black hover:bg-gray-50'
			onClick={(event) => clickHandler(event)}
		>
			<span>Claim</span>
		</button>
	);
};

ClaimLmrButton.displayName = 'ClaimLmrButton';
ClaimLmrButton.whyDidYouRender = false;
