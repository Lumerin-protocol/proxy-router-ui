import React, { Dispatch, SetStateAction } from 'react';
import { ButtonWrapper } from './Buttons.styled';
import EditIcon from '../../../../images/icons/edit.png';

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
		<ButtonWrapper>
			<button type='button' onClick={(event) => clickHandler(event)}>
				<img src={EditIcon} alt='' />
			</button>
			<p>Edit</p>
		</ButtonWrapper>
	);
};

EditButton.displayName = 'EditButton';
EditButton.whyDidYouRender = false;
