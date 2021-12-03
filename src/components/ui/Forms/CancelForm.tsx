import { Fragment, MouseEventHandler, useEffect, useState } from 'react';
import { AlertMessage, ContentState, ContractState, UpdateFormProps } from '../../../types';
import { isNoCancel } from '../../../utils';
import { Alert } from '../Alert';
import { Spinner } from '../Spinner';

export const CancelForm: React.FC<UpdateFormProps> = ({ contracts, contractId, userAccount, web3, setOpen }) => {
	const [contentState, setContentState] = useState<string>(ContentState.Review);
	const [isConfirmModal, setIsConfirmModal] = useState<boolean>(false);
	const [alertOpen, setAlertOpen] = useState<boolean>(false);

	const contract = contracts.filter((contract) => contract.id === contractId)[0];

	const cancelSubmitHandler: MouseEventHandler<HTMLButtonElement> = (event) => {
		if (isNoCancel(contract, userAccount)) return;
		setIsConfirmModal(true);
		setContentState(ContentState.Confirm);
	};

	const cancelContractAsync: () => void = () => {
		// Confirm
		if (contentState === ContentState.Confirm) {
			if (contract.state !== ContractState.Available && contract.state !== ContractState.Running) {
				setAlertOpen(true);
				return;
			}
			setIsConfirmModal(false);
			setContentState(ContentState.Pending);
		}

		// Pending
		if (contentState === ContentState.Pending) {
			if (isNoCancel(contract, userAccount)) return;
			// setContentState(ContentState.Complete);
		}

		// Completed
		if (contentState === ContentState.Complete) setOpen(false);
	};

	// Check if user is buyer or seller and contract is running
	useEffect(() => {
		if (isNoCancel(contract, userAccount)) setAlertOpen(true);
	}, []);

	// Create transaction when in pending state
	useEffect(() => {
		if (contentState === ContentState.Pending) cancelContractAsync();
	}, [contentState]);

	return (
		<Fragment>
			<Alert message={AlertMessage.Edit} open={alertOpen} setOpen={setAlertOpen} />
			<div className={`flex flex-col justify-center w-full font-Inter font-medium`} style={{ minWidth: '26rem', maxWidth: '32rem' }}>
				{!isConfirmModal && contentState === ContentState.Review ? (
					<Fragment>
						<div className='flex justify-between bg-white text-black modal-input-spacing pb-4 border-transparent rounded-t-5'>
							<div>
								<p className='text-3xl text-red-500'>Cancel Contract</p>
							</div>
						</div>
						<div className='bg-white modal-input-spacing'>
							You are about to cancel your contract, and the purchased hashrate will no longer be delivered.
						</div>
						<div className='flex gap-6 bg-white modal-input-spacing pb-8 rounded-b-5'>
							<button
								type='submit'
								className={`h-16 w-full py-2 px-4 btn-modal border-red-500 bg-white text-sm font-medium text-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500`}
								onClick={cancelSubmitHandler}
							>
								Cancel Contract
							</button>
						</div>
					</Fragment>
				) : null}
				{isConfirmModal && contentState === ContentState.Confirm ? (
					<Fragment>
						<div className='flex flex-col text-red-500'>
							<p className='bg-white modal-input-spacing border-transparent rounded-t-5'>Make sure you want to cancel the contract.</p>
							<p className='bg-white modal-input-spacing border-transparent pt-0'>The cancellation is permanent.</p>
						</div>
						<div className='flex gap-6 bg-white modal-input-spacing pb-8 rounded-b-5'>
							<button
								type='submit'
								className={`h-16 w-full py-2 px-4 btn-modal border-red-500 bg-white text-sm font-medium text-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500`}
								onClick={cancelContractAsync}
							>
								Confirm Cancellation
							</button>
						</div>
					</Fragment>
				) : null}
				{contentState === ContentState.Pending ? (
					<div className='flex flex-col items-center bg-white text-black modal-input-spacing pb-8 border-transparent rounded-5'>
						<div className='flex justify-center'>
							<p className='bg-white modal-input-spacing border-transparent pt-0 mb-8 text-xl'>Your transaction is pending.</p>
						</div>
						<Spinner />
					</div>
				) : null}
			</div>
		</Fragment>
	);
};

CancelForm.displayName = 'CancelForm';
CancelForm.whyDidYouRender = false;
