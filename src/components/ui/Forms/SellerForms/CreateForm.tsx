/* eslint-disable react-hooks/exhaustive-deps */
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Contract } from 'web3-eth-contract';
import { ContentState, InputValuesCreateForm, Text } from '../../../../types';
import { classNames, getButton, printError } from '../../../../utils';
import { CompletedContent } from './CompletedContent';
import { ConfirmContent } from './ConfirmContent';
import { ReviewContent } from './ReviewContent';

// Form text setup
const buttonText: Text = {
	create: 'Create New Contract',
	confirm: 'Confirm New Contract',
	completed: 'Close',
};

// Used to set initial state for contentData to prevent undefined error
const initialFormData: InputValuesCreateForm = {
	walletAddress: '',
	contractTime: 0,
	speed: 0,
	listPrice: 0,
};

interface CreateFormProps {
	userAccount: string;
	marketplaceContract: Contract | undefined;
	setOpen: Dispatch<SetStateAction<boolean>>;
}

export const CreateForm: React.FC<CreateFormProps> = ({ userAccount, marketplaceContract, setOpen }) => {
	const [buttonOpacity, setButtonOpacity] = useState<string>('25');
	const [contentState, setContentState] = useState<string>(ContentState.Create);
	const [formData, setFormData] = useState<InputValuesCreateForm>(initialFormData);

	// Input validation setup
	const {
		register,
		handleSubmit,
		formState: { errors, isValid },
	} = useForm<InputValuesCreateForm>({ mode: 'onBlur' });

	const createContractAsync: (data: InputValuesCreateForm) => void = async (data) => {
		// Create
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
				// TODO: what should the validator fee be?
				// TODO: convert usd to lmr (aggregate of exchanges?)
				const receipt = await marketplaceContract?.methods
					.setCreateRentalContract(formData.listPrice, 0, formData.speed, (formData.contractTime as number) * 3600, 100)
					.send({ from: userAccount });
				if (receipt?.status) {
					setContentState(ContentState.Complete);
				}
			} catch (error) {
				const typedError = error as Error;
				printError(typedError.message, typedError.stack as string);
				// crash app if can't communicate with webfacing contract
				throw typedError;
			}
		}
	};

	// Create transaction when in pending state
	useEffect(() => {
		if (contentState === ContentState.Pending) createContractAsync(formData);
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
				content = <CompletedContent contentState={contentState} />;
				break;
			default:
				buttonContent = buttonText.create as string;
				content = <ReviewContent register={register} errors={errors} />;
		}
	};
	createContent();

	// Set styles and button based on ContentState
	const bgColor = contentState === ContentState.Complete || contentState === ContentState.Confirm ? 'bg-black' : 'bg-lumerin-aqua';

	return (
		<div className={`flex flex-col justify-center w-full font-Inter font-medium`} style={{ minWidth: '26rem', maxWidth: '32rem' }}>
			<div className='flex justify-between p-4 bg-white text-black border-transparent rounded-t-5'>
				<div className={classNames(contentState === ContentState.Complete || contentState === ContentState.Pending ? 'hidden' : 'block')}>
					<p className='text-3xl'>Create New Contract</p>
					<p>Sell your hashpower to the Lumerin Marketplace</p>
				</div>
			</div>
			{content}
			<div className='flex gap-6 bg-white p-4 pt-14 rounded-b-5'>
				<button
					type='submit'
					className={`h-16 w-full py-2 px-4 btn-modal border-lumerin-aqua bg-white text-sm font-medium text-lumerin-aqua hover:bg-lumerin-aqua hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lumerin-aqua`}
					onClick={() => setOpen(false)}
				>
					Close
				</button>
				{contentState !== ContentState.Pending
					? getButton(contentState, bgColor, buttonOpacity, buttonContent, setOpen, handleSubmit, createContractAsync)
					: null}
			</div>
		</div>
	);
};

CreateForm.displayName = 'CreateForm';
CreateForm.whyDidYouRender = false;
