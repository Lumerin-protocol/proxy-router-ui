import React, { Dispatch, SetStateAction } from 'react';

interface CancelButtonProps {
	contractId: string;
	setContractId: Dispatch<SetStateAction<string>>;
	cancelClickHandler: React.MouseEventHandler<HTMLButtonElement>;
}

export const CancelButton: React.FC<CancelButtonProps> = ({ contractId, setContractId, cancelClickHandler }) => {
	const clickHandler: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void = (event) => {
		setContractId(contractId);
		cancelClickHandler(event);
	};

	return (
		<button
			type='button'
			className='-ml-px relative inline-flex items-center px-4 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500'
			onClick={(event) => clickHandler(event)}
		>
			<span>Cancel</span>
		</button>
	);
};

CancelButton.displayName = 'CancelButton';
CancelButton.whyDidYouRender = false;
