import { Dispatch, SetStateAction } from 'react';
import { CancelButton } from './CancelButton';
import { EditButton } from './EditButton';

interface EditCancelButtonGroupProps {
	contractId: string;
	setContractId: Dispatch<SetStateAction<string>>;
	editClickHandler: React.MouseEventHandler<HTMLButtonElement>;
	cancelClickHandler: React.MouseEventHandler<HTMLButtonElement>;
}
export const EditCancelButtonGroup: React.FC<EditCancelButtonGroupProps> = ({ contractId, setContractId, editClickHandler, cancelClickHandler }) => {
	return (
		<span className='relative inline-flex items-center px-4 bg-white text-sm font-medium text-gray-700'>
			<EditButton contractId={contractId} setContractId={setContractId} editClickHandler={editClickHandler} />
			<CancelButton contractId={contractId} setContractId={setContractId} cancelClickHandler={cancelClickHandler} />
		</span>
	);
};
