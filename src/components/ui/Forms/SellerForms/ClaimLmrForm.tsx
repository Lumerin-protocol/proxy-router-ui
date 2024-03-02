/* eslint-disable react-hooks/exhaustive-deps */
import { Fragment, MouseEventHandler, useEffect, useState } from 'react';
import { CloseOutType, ContentState, ContractState, HashRentalContract } from '../../../../types';
import { isNoClaim, printError } from '../../../../utils';
import { Spinner } from '../../Spinner.styled';
import { EthereumGateway } from '../../../../gateway/ethereum';

interface ClaimLmrFormProps {
	contracts: HashRentalContract[];
	contractId: string;
	userAccount: string;
	web3Gateway?: EthereumGateway;
	currentBlockTimestamp?: number;
	onClose: () => void;
}

export const ClaimLmrForm: React.FC<ClaimLmrFormProps> = ({
	contracts,
	contractId,
	userAccount,
	web3Gateway,
	onClose,
	currentBlockTimestamp,
}) => {
	const [contentState, setContentState] = useState<string>(ContentState.Review);
	const [isConfirmModal, setIsConfirmModal] = useState<boolean>(false);

	const contract = contracts.filter((contract) => contract.id === contractId)[0];

	const claimSubmitHandler: MouseEventHandler<HTMLButtonElement> = (event) => {
		if (isNoClaim(userAccount, contract.seller as string)) return;
		setIsConfirmModal(true);
		setContentState(ContentState.Confirm);
	};

	const getCloseOutType: (contract: HashRentalContract) => CloseOutType = (contract) => {
		if (currentBlockTimestamp) {
			const contractDuration = currentBlockTimestamp - parseInt(contract.timestamp as string);
			const isComplete = contractDuration >= parseInt(contract.length as string);
			if (contract.state === ContractState.Available) return CloseOutType.SellerClaimNoClose;
			if (contract.state === ContractState.Running && !isComplete)
				return CloseOutType.SellerClaimNoClose;
			if (contract.state === ContractState.Running && isComplete)
				return CloseOutType.CloseAndClaimAtCompletion;
			return CloseOutType.SellerClaimNoClose;
		}
		return CloseOutType.SellerClaimNoClose;
	};

	const claimLmrAsync: () => void = async () => {
		// Confirm
		if (contentState === ContentState.Confirm) {
			setIsConfirmModal(false);
			setContentState(ContentState.Pending);
		}

		// Pending
		if (contentState === ContentState.Pending) {
			if (isNoClaim(userAccount, contract.seller as string)) {
				return;
			}
			if (!web3Gateway) {
				console.error('missing web3 gateway');
				return;
			}

			try {
				const closeOutType = getCloseOutType(contract);
				const receipt = await web3Gateway.closeContract({
					contractAddress: contractId,
					from: userAccount,
					fee: '0',
					closeoutType: closeOutType,
				});
				if (receipt.status) {
					setContentState(ContentState.Complete);
				} else {
					setContentState(ContentState.Review);
				}
			} catch (error) {
				const typedError = error as Error;
				printError(typedError.message, typedError.stack as string);
				onClose();
			}
		}
	};

	// Create transaction when in pending state
	useEffect(() => {
		if (contentState === ContentState.Pending) claimLmrAsync();
	}, [contentState]);

	return (
		<Fragment>
			<div
				className={`flex flex-col justify-center w-full min-w-21 max-w-32 sm:min-w-26 font-Inter font-medium`}
			>
				{!isConfirmModal && contentState === ContentState.Review ? (
					<Fragment>
						<div className='flex justify-center bg-white text-black modal-input-spacing pb-4 border-transparent rounded-t-5'>
							<div>
								<p className='text-3xl text-black'>Claim LMR Tokens</p>
							</div>
						</div>
						<div className='bg-white modal-input-spacing text-center'>
							You are about to claim your LMR tokens.
						</div>
						<div className='flex gap-6 bg-white modal-input-spacing pb-8 rounded-b-5'>
							<button
								type='submit'
								className={`h-16 w-full py-2 px-4 btn-modal border-lumerin-aqua bg-white text-sm font-medium text-lumerin-aqua focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lumerin-aqua`}
								onClick={claimSubmitHandler}
							>
								Continue
							</button>
						</div>
					</Fragment>
				) : null}
				{isConfirmModal && contentState === ContentState.Confirm ? (
					<Fragment>
						<div className='flex flex-col text-black'>
							<p className='bg-white modal-input-spacing border-transparent rounded-t-5 text-center'>
								Do you want to claim your tokens?
							</p>
						</div>
						<div className='flex gap-6 bg-white modal-input-spacing pb-8 rounded-b-5'>
							<button
								type='submit'
								className={`h-16 w-full py-2 px-4 btn-modal border-lumerin-aqua bg-white text-sm font-medium text-lumerin-aqua focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lumerin-aqua`}
								onClick={claimLmrAsync}
							>
								Claim Tokens
							</button>
						</div>
					</Fragment>
				) : null}
				{contentState === ContentState.Pending ? (
					<div className='flex flex-col items-center bg-white text-black modal-input-spacing pb-8 border-transparent rounded-5'>
						<div className='flex justify-center'>
							<p className='bg-white modal-input-spacing border-transparent pt-0 mb-8 text-xl text-center'>
								Your transaction is pending.
							</p>
						</div>
						<Spinner />
					</div>
				) : null}
				{contentState === ContentState.Complete ? (
					<div className='flex bg-white text-lumerin-aqua modal-input-spacing pb-8 border-transparent rounded-5'>
						<p className='mb-1'>Your LMR tokens have been claimed successfully.</p>
					</div>
				) : null}
			</div>
		</Fragment>
	);
};

ClaimLmrForm.displayName = 'ClaimLmrForm';
ClaimLmrForm.whyDidYouRender = false;
