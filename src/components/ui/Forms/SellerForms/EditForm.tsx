/* eslint-disable react-hooks/exhaustive-deps */
import { Fragment, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { AlertMessage, CloseOutType, ContentState, HashRentalContract, InputValuesCreateForm, Text, UpdateFormProps } from '../../../../types';
import { getButton, isNoEditSeller, printError } from '../../../../utils';
import { Alert } from '../../Alert';
import { CompletedContent } from './CompletedContent';
import { ConfirmContent } from './ConfirmContent';
import { ReviewContent } from './ReviewContent';
import { AbiItem } from 'web3-utils';
import ImplementationContract from '../../../../contracts/Implementation.json';
import { multiplyByDigits } from '../../../../web3/helpers';

// Form text setup
const buttonText: Text = {
	edit: 'Edit Contract',
	confirm: 'Confirm Changes',
	completed: 'Close',
};

// Set initial state to current contract values
const getFormData: (contract: HashRentalContract) => InputValuesCreateForm = (contract) => {
	return {
		walletAddress: contract.seller as string,
		contractTime: parseInt(contract.length as string) / 3600,
		speed: parseInt(contract.speed as string),
		listPrice: contract.price as number,
	};
};

export const EditForm: React.FC<UpdateFormProps> = ({ web3, contracts, contractId, userAccount, setOpen }) => {
	const contract = contracts.filter((contract) => contract.id === contractId)[0];

	const [buttonOpacity, setButtonOpacity] = useState<string>('25');
	const [contentState, setContentState] = useState<string>(ContentState.Create);
	const [formData, setFormData] = useState<InputValuesCreateForm>(getFormData(contract));
	const [alertOpen, setAlertOpen] = useState<boolean>(false);

	// Input validation setup
	const {
		register,
		handleSubmit,
		formState: { errors, isValid },
	} = useForm<InputValuesCreateForm>({ mode: 'onBlur' });

	const editContractAsync: (data: InputValuesCreateForm) => void = async (data) => {
		if (isNoEditSeller(contract, userAccount)) return;
		// Edit
		if (isValid && contentState === ContentState.Create) {
			setContentState(ContentState.Confirm);
			setFormData(data);
		}

		// Confirm
		if (isValid && contentState === ContentState.Confirm) {
			setContentState(ContentState.Pending);
		}

		// Pending
		if (isValid && contentState === ContentState.Pending) {
			// Create contract
			try {
				// TODO: convert usd to lmr (aggregate of exchanges?)
				if (web3) {
					const gasLimit = 1000000;
					const implementationContract = new web3.eth.Contract(ImplementationContract.abi as AbiItem[], contract.id as string);
					const price = multiplyByDigits(formData.listPrice as number);
					const receipt = await implementationContract.methods
						.setUpdatePurchaseInformation(
							price,
							0,
							formData.speed,
							(formData.contractTime as number) * 3600,
							CloseOutType.CloseNoClaimAtCompletion
						)
						.send({ from: userAccount, gas: gasLimit });
					if (receipt?.status) {
						setContentState(ContentState.Complete);
					}
				}
			} catch (error) {
				const typedError = error as Error;
				printError(typedError.message, typedError.stack as string);
				setOpen(false);
			}
		}

		// Completed
		if (contentState === ContentState.Complete) setOpen(false);
	};

	// Check if user is seller and contract is running
	useEffect(() => {
		let timeoutId: NodeJS.Timeout;
		if (isNoEditSeller(contract, userAccount)) {
			setAlertOpen(true);
			timeoutId = setTimeout(() => setOpen(false), 3000);
		}

		return () => clearTimeout(timeoutId);
	}, []);

	// Create transaction when in pending state
	useEffect(() => {
		if (contentState === ContentState.Pending) editContractAsync(formData);
	}, [contentState]);

	// Change opacity of Review Order button based on input validation
	useEffect(() => {
		if (isValid) {
			setButtonOpacity('100');
		} else {
			setButtonOpacity('25');
		}
	}, [isValid]);

	// Content setup
	// Defaults to create state
	// Initialize since html element needs a value on first render
	let buttonContent = '';
	let content = <div></div>;
	const createContent: () => void = () => {
		switch (contentState) {
			case ContentState.Confirm:
				buttonContent = buttonText.confirm as string;
				content = <ConfirmContent data={formData} />;
				break;
			case ContentState.Pending:
			case ContentState.Complete:
				buttonContent = buttonText.completed as string;
				content = <CompletedContent contentState={contentState} isEdit />;
				break;
			default:
				buttonContent = buttonText.edit as string;
				content = <ReviewContent web3={web3} register={register} errors={errors} data={formData} />;
		}
	};
	createContent();

	// Set styles and button based on ContentState
	const bgColor = contentState === ContentState.Complete || contentState === ContentState.Confirm ? 'bg-black' : 'bg-lumerin-aqua';

	return (
		<Fragment>
			<Alert message={AlertMessage.NoEditSeller} open={alertOpen} setOpen={setAlertOpen} />
			<div className={`flex flex-col justify-center w-full min-w-21 max-w-32 sm:min-w-26 font-Inter font-medium`}>
				<div className='flex justify-between p-4 bg-white text-black border-transparent rounded-t-5'>
					<div className={contentState === ContentState.Complete || contentState === ContentState.Pending ? 'hidden' : 'block'}>
						<p className='text-3xl'>Edit Contract</p>
						<p>Sell your hashpower to the Lumerin Marketplace</p>
					</div>
				</div>
				{content}
				<div className='flex gap-6 bg-white p-4 pt-14 rounded-b-5'>
					<button
						type='submit'
						className={`h-16 w-full py-2 px-4 btn-modal border-lumerin-aqua bg-white text-sm font-medium text-lumerin-aqua focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lumerin-aqua`}
						onClick={() => setOpen(false)}
					>
						Close
					</button>
					{contentState !== ContentState.Pending
						? getButton(contentState, bgColor, buttonOpacity, buttonContent, setOpen, handleSubmit, editContractAsync)
						: null}
				</div>
			</div>
		</Fragment>
	);
};

EditForm.displayName = 'EditForm';
EditForm.whyDidYouRender = false;
