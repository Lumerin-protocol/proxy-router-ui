/* eslint-disable react-hooks/exhaustive-deps */
import { Dispatch, Fragment, SetStateAction, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';
import { ContentState, InputValuesCreateForm, Text } from '../../../../types';
import { getButton, printError } from '../../../../utils';
import { multiplyByDigits } from '../../../../web3/helpers';
import { FormButtonsWrapper, SecondaryButton } from '../FormButtons/Buttons.styled';
import { CompletedContent } from './CompletedContent';
import { ConfirmContent } from './ConfirmContent';
import { ReviewContent } from './ReviewContent';
import { Alert as AlertMUI } from '@mui/material';

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

export const CreateForm: React.FC<CreateFormProps> = ({
	userAccount,
	cloneFactoryContract,
	web3,
	setOpen,
}) => {
	const [contentState, setContentState] = useState<string>(ContentState.Create);
	const [formData, setFormData] = useState<InputValuesCreateForm>(getFormData(userAccount));

	// Input validation setup
	const {
		register,
		handleSubmit,
		formState: { errors, isValid },
	} = useForm<InputValuesCreateForm>({ mode: 'onBlur' });

	const createContractAsync: (data: InputValuesCreateForm) => void = async (data) => {
		console.log('createContractAsync: ', data);
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
					const contractDuration =
						(formData.contractTime as number) < 12
							? (formData.contractTime as number) * 600
							: (formData.contractTime as number) * 3600;
					// TODO: update to actual validator address
					const validatorAddress = '0x0000000000000000000000000000000000000000';
					const price = multiplyByDigits(formData.listPrice as number);
					let speed;
					if (formData && formData.speed) {
						speed = formData.speed * 10 ** 12;
					} else {
						speed = 0;
					}
					console.log({
						price,
						limit: 0,
						speed,
						contractDuration,
						validatorAddress,
					});
					const receipt = await cloneFactoryContract?.methods
						.setCreateNewRentalContract(price, 0, speed, contractDuration, validatorAddress, '')
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
	const display =
		contentState === ContentState.Pending || contentState === ContentState.Complete ? false : true;

	return (
		<form onSubmit={handleSubmit(createContractAsync)}>
			{display && (
				<>
					<h2>Create New Contract</h2>
					<p>Sell your hashpower on the Lumerin Marketplace</p>
				</>
			)}
			<AlertMUI severity='warning' sx={{ margin: '3px 0' }}>
				Thank you for choosing the Lumerin Hashpower Marketplace. To sell hashpower, please download
				the{' '}
				<a
					href='https://lumerin.io/wallet'
					target='_blank'
					rel='noreferrer'
					className='text-lumerin-dark-blue underline'
				>
					Lumerin wallet desktop application
				</a>{' '}
				to ensure a smooth and secure transaction.
			</AlertMUI>
			{content}
			<FormButtonsWrapper>
				<SecondaryButton type='submit' onClick={() => setOpen(false)}>
					Close
				</SecondaryButton>
				{contentState !== ContentState.Pending &&
					getButton(contentState, buttonContent, setOpen, handleSubmit)}
			</FormButtonsWrapper>
		</form>
	);
};

CreateForm.displayName = 'CreateForm';
CreateForm.whyDidYouRender = false;
