import React, { Dispatch, SetStateAction } from 'react';

interface EditButtonProps {
	contractId: string;
	setContractId: Dispatch<SetStateAction<string>>;
	editClickHandler: React.MouseEventHandler<HTMLButtonElement>;
}

export const EditButton: React.FC<EditButtonProps> = ({
	contractId,
	setContractId,
	editClickHandler,
}) => {
	const clickHandler: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void = (
		event
	) => {
		setContractId(contractId);
		editClickHandler(event);
	};

	return (
		<button
			type='button'
			className='btn-edit-cancel border-gray-300 rounded-5 p-auto bg-lumerin-dark-gray text-black font-medium'
			onClick={(event) => clickHandler(event)}
		>
			<span>Edit</span>
		</button>
	);
};

EditButton.displayName = 'EditButton';
EditButton.whyDidYouRender = false;
