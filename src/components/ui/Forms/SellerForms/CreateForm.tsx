/* eslint-disable react-hooks/exhaustive-deps */
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ContentState, InputValuesCreateForm, Text } from '../../../../types';
import { getButton, printError } from '../../../../utils';
import { multiplyByDigits } from '../../../../web3/helpers';
import { FormButtonsWrapper, SecondaryButton } from '../FormButtons/Buttons.styled';
import { CompletedContent } from './CompletedContent';
import { ConfirmContent } from './ConfirmContent';
import { ReviewContent } from './ReviewContent';
import { EthereumGateway } from '../../../../gateway/ethereum';

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
	web3Gateway?: EthereumGateway;
	setOpen: Dispatch<SetStateAction<boolean>>;
}

export const CreateForm: React.FC<CreateFormProps> = ({ userAccount, web3Gateway, setOpen }) => {
	const [contentState, setContentState] = useState<string>(ContentState.Create);
	const [formData, setFormData] = useState<InputValuesCreateForm>(getFormData(userAccount));

	// Input validation setup
	const {
		register,
		handleSubmit,
		formState: { errors, isValid },
	} = useForm<InputValuesCreateForm>({ mode: 'onBlur' });

	const createContractAsync = async (data: InputValuesCreateForm): Promise<void> => {
		if (!web3Gateway) {
			console.error('web3Gateway is not defined');
			return;
		}

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
				const contractDuration =
					(formData.contractTime as number) < 12
						? (formData.contractTime as number) * 600
						: (formData.contractTime as number) * 3600;
				// TODO: update to actual validator address
				const price = multiplyByDigits(formData.listPrice as number);
				let speed;
				if (formData && formData.speed) {
					speed = formData.speed * 10 ** 12;
				} else {
					speed = 0;
				}
				const receipt = await web3Gateway.createContract({
					profitTarget: '0',
					speed: String(speed),
					durationSeconds: contractDuration,
					pubKey: '', // TODO: update to actual public key retrieved from metamask
					from: userAccount,
				});
				if (receipt?.status) {
					setContentState(ContentState.Complete);
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
			{/* <AlertMUI severity='warning' sx={{ margin: '3px 0' }}>
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
			</AlertMUI> */}
			{content}
			<FormButtonsWrapper>
				<SecondaryButton type='submit' onClick={() => setOpen(false)}>
					Close
				</SecondaryButton>
				{contentState !== ContentState.Pending &&
					getButton(contentState, buttonContent, () => {}, handleSubmit as any, !isValid)}
			</FormButtonsWrapper>
		</form>
	);
};

CreateForm.displayName = 'CreateForm';
CreateForm.whyDidYouRender = false;
