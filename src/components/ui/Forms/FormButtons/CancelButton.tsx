import React, { Dispatch, SetStateAction } from 'react';

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
		<button
			type='button'
			className='btn-edit-cancel rounded-5 border border-gray-300 bg-white font-medium text-black hover:bg-gray-50'
			onClick={(event) => clickHandler(event)}
		>
			<span>Cancel</span>
		</button>
	);
};

CancelButton.displayName = 'CancelButton';
CancelButton.whyDidYouRender = false;
