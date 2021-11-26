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
		<span className='relative inline-flex items-center px-4 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500'>
			<EditButton contractId={contractId} setContractId={setContractId} editClickHandler={editClickHandler} />
			<CancelButton contractId={contractId} setContractId={setContractId} cancelClickHandler={cancelClickHandler} />
		</span>
	);
};
