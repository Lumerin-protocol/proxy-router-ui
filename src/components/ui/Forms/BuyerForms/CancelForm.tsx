/* eslint-disable react-hooks/exhaustive-deps */
import { Fragment, MouseEventHandler, useEffect, useState } from 'react';
import { AlertMessage, ContentState, ContractState, Receipt, UpdateFormProps } from '../../../../types';
import { isNoCancel, printError } from '../../../../utils';
import { Alert } from '../../Alert';
import { Spinner } from '../../Spinner';
import ImplementationContract from '../../../../contracts/Implementation.json';
import { AbiItem } from 'web3-utils';

export const CancelForm: React.FC<UpdateFormProps> = ({ contracts, contractId, userAccount, web3, setOpen }) => {
	const [contentState, setContentState] = useState<string>(ContentState.Review);
	const [isConfirmModal, setIsConfirmModal] = useState<boolean>(false);
	const [alertOpen, setAlertOpen] = useState<boolean>(false);

	const contract = contracts.filter((contract) => contract.id === contractId)[0];
	const isBuyer = userAccount === contract.buyer;

	const cancelSubmitHandler: MouseEventHandler<HTMLButtonElement> = (event) => {
		if (isNoCancel(contract, userAccount)) return;
		setIsConfirmModal(true);
		setContentState(ContentState.Confirm);
	};

	const cancelContractAsync: () => void = async () => {
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

			try {
				if (web3) {
					const implementationContractInstance = new web3.eth.Contract(ImplementationContract.abi as AbiItem[], contract.id as string);
					const receipt: Receipt = await implementationContractInstance.methods
						.setContractCloseOut()
						.send({ from: userAccount, gas: 1000000 });
					if (receipt.status) {
						setContentState(ContentState.Complete);
					} else {
						// TODO: cancellation has failed so surface to user
					}
				}
			} catch (error) {
				const typedError = error as Error;
				printError(typedError.message, typedError.stack as string);
				setOpen(false);
			}
		}
	};

	// Completed
	if (contentState === ContentState.Complete) setOpen(false);

	// Check if user is buyer or seller and contract is running
	useEffect(() => {
		let timeoutId: NodeJS.Timeout;
		if (isNoCancel(contract, userAccount)) {
			setAlertOpen(true);
			timeoutId = setTimeout(() => setOpen(false), 3000);
		}

		return () => clearTimeout(timeoutId);
	}, []);

	// Create transaction when in pending state
	useEffect(() => {
		if (contentState === ContentState.Pending) cancelContractAsync();
	}, [contentState]);

	const text = isBuyer ? 'Order' : 'Contract';

	return (
		<Fragment>
			<Alert message={AlertMessage.NoCancelBuyer} open={alertOpen} setOpen={setAlertOpen} />
			<div className={`flex flex-col justify-center w-full font-Inter font-medium`} style={{ minWidth: '26rem', maxWidth: '32rem' }}>
				{!isConfirmModal && contentState === ContentState.Review ? (
					<Fragment>
						<div className='flex justify-between bg-white text-black modal-input-spacing pb-4 border-transparent rounded-t-5'>
							<div>
								<p className='text-3xl text-red-500'>Cancel {text}</p>
							</div>
						</div>
						<div className='bg-white modal-input-spacing'>
							You are about to cancel your {text.toLowerCase()}, and the purchased hashrate will no longer be delivered.
						</div>
						<div className='flex gap-6 bg-white modal-input-spacing pb-8 rounded-b-5'>
							<button
								type='submit'
								className={`h-16 w-full py-2 px-4 btn-modal border-red-500 bg-white text-sm font-medium text-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500`}
								onClick={cancelSubmitHandler}
							>
								Cancel {text}
							</button>
						</div>
					</Fragment>
				) : null}
				{isConfirmModal && contentState === ContentState.Confirm ? (
					<Fragment>
						<div className='flex flex-col text-red-500'>
							<p className='bg-white modal-input-spacing border-transparent rounded-t-5'>
								Make sure you want to cancel the {text.toLowerCase()}.
							</p>
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
				{contentState === ContentState.Complete ? (
					<div className='flex bg-white text-black modal-input-spacing pb-8 border-transparent rounded-5'>
						<p className='mb-1'>The {text.toLowerCase()} has been cancelled successfully, and its status will update shortly.</p>
					</div>
				) : null}
			</div>
		</Fragment>
	);
};

CancelForm.displayName = 'CancelForm';
CancelForm.whyDidYouRender = false;
