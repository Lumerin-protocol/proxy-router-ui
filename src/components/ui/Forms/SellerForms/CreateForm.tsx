/* eslint-disable react-hooks/exhaustive-deps */
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';
import { ContentState, InputValuesCreateForm, Text } from '../../../../types';
import { getButton, getPublicKeyAsync, printError } from '../../../../utils';
import { multiplyByDigits } from '../../../../web3/helpers';
import { CompletedContent } from './CompletedContent';
import { ConfirmContent } from './ConfirmContent';
import { ReviewContent } from './ReviewContent';

// Form text setup
const buttonText: Text = {
	create: 'Create New Contract',
	confirm: 'Confirm New Contract',
	completed: 'Close',
};

// Set initial state for formData
const getFormData: (userAccount: string) => InputValuesCreateForm = (userAccount) => {
	return {
		walletAddress: userAccount,
		contractTime: 0,
		speed: 0,
		listPrice: 0,
	};
};

interface CreateFormProps {
	userAccount: string;
	cloneFactoryContract: Contract | undefined;
	web3: Web3 | undefined;
	setOpen: Dispatch<SetStateAction<boolean>>;
}

export const CreateForm: React.FC<CreateFormProps> = ({ userAccount, cloneFactoryContract, web3, setOpen }) => {
	const [buttonOpacity, setButtonOpacity] = useState<string>('25');
	const [contentState, setContentState] = useState<string>(ContentState.Create);
	const [formData, setFormData] = useState<InputValuesCreateForm>(getFormData(userAccount));

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
				if (web3) {
					// TODO: update to actual validator address
					const validatorAddress = '0x0000000000000000000000000000000000000000';
					const publicKey = (await getPublicKeyAsync(userAccount)) as Buffer;
					const publicKeyHex = `04${publicKey.toString('hex')}`;
					const price = multiplyByDigits(formData.listPrice as number);
					const receipt = await cloneFactoryContract?.methods
						.setCreateNewRentalContract(price, 0, formData.speed, (formData.contractTime as number) * 3600, validatorAddress)
						.send({ from: userAccount });
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
				content = <ReviewContent register={register} errors={errors} data={formData} isCreate />;
		}
	};
	createContent();

	// Set styles and button based on ContentState
	const bgColor = contentState === ContentState.Complete || contentState === ContentState.Confirm ? 'bg-black' : 'bg-lumerin-aqua';

	return (
		<div className={`flex flex-col justify-center w-full min-w-21 max-w-32 sm:min-w-26 md:min-w-28 font-Inter font-medium`}>
			<div className='flex justify-between p-4 bg-white text-black border-transparent rounded-t-5'>
				<div className={contentState === ContentState.Complete || contentState === ContentState.Pending ? 'hidden' : 'block'}>
					<p className='text-3xl'>Create New Contract</p>
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
					? getButton(contentState, bgColor, buttonOpacity, buttonContent, setOpen, handleSubmit, createContractAsync)
					: null}
			</div>
		</div>
	);
};

CreateForm.displayName = 'CreateForm';
CreateForm.whyDidYouRender = false;
