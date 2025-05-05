import React, { Dispatch, SetStateAction } from 'react';
import { ActionButtonWrapper } from './Buttons.styled';
import EditIcon from '../../../../images/icons/edit.png';

interface EditButtonProps {
	contractId: string;
	setContractId: (contractId: string) => void;
	editClickHandler: (event: React.MouseEvent<HTMLButtonElement>) => void;
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
		<ActionButtonWrapper>
			<button type='button' onClick={(event) => clickHandler(event)}>
				<img src={EditIcon} alt='' />
			</button>
			<p className='text-white'>Edit</p>
		</ActionButtonWrapper>
	);
};

EditButton.displayName = 'EditButton';
EditButton.whyDidYouRender = false;
