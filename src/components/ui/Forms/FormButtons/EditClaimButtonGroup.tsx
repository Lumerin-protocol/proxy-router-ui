import { Dispatch, SetStateAction } from 'react';
import { ClaimLmrButton } from './ClaimLmrButton';
import { EditButton } from './EditButton';

interface EditClaimButtonGroupProps {
	contractId: string;
	setContractId: Dispatch<SetStateAction<string>>;
	editClickHandler: React.MouseEventHandler<HTMLButtonElement>;
	claimLmrClickHandler: React.MouseEventHandler<HTMLButtonElement>;
}
export const EditClaimButtonGroup: React.FC<EditClaimButtonGroupProps> = ({ contractId, setContractId, editClickHandler, claimLmrClickHandler }) => {
	return (
		<span className='inline-flex items-center pr-8 bg-white text-sm font-medium text-gray-700'>
			<EditButton contractId={contractId} setContractId={setContractId} editClickHandler={editClickHandler} />
			<ClaimLmrButton contractId={contractId} setContractId={setContractId} claimLmrClickHandler={claimLmrClickHandler} />
		</span>
	);
};

EditClaimButtonGroup.displayName = 'EditClaimButtonGroup';
EditClaimButtonGroup.whyDidYouRender = false;
