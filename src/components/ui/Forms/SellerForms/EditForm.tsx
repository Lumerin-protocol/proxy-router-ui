/* eslint-disable react-hooks/exhaustive-deps */
import { Fragment, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
	AlertMessage,
	ContentState,
	HashRentalContract,
	InputValuesCreateForm,
	Text,
} from '../../../../types';
import { getButton, isNoEditSeller, printError } from '../../../../utils';
import { Alert } from '../../Alert';
import { CompletedContent } from './CompletedContent';
import { ConfirmContent } from './ConfirmContent';
import { ReviewContent } from './ReviewContent';
import { multiplyByDigits } from '../../../../web3/helpers';
import { EthereumGateway } from '../../../../gateway/ethereum';

// Form text setup
const buttonText: Text = {
	edit: 'Edit Contract',
	confirm: 'Confirm Changes',
	completed: 'Close',
};
let contentState: any, setContentState: any;

// Set initial state to current contract values
const getFormData: (contract: HashRentalContract) => InputValuesCreateForm = (contract) => {
	return {
		walletAddress: contract.seller as string,
		contractTime: parseInt(contract.length as string) / 3600,
		speed: parseInt(contract.speed as string),
		listPrice: Number(contract.price),
	};
};

export interface EditFormProps {
	contracts: HashRentalContract[];
	contractId: string;
	userAccount: string;
	web3Gateway?: EthereumGateway;
	currentBlockTimestamp?: number;
	closeForm: () => void;
}

export const EditForm: React.FC<EditFormProps> = ({
	web3Gateway,
	contracts,
	contractId,
	userAccount,
	closeForm,
}) => {
	const contract = contracts.filter((contract) => contract.id === contractId)[0];
	[contentState, setContentState] = useState<string>(ContentState.Create);

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
			if (!web3Gateway) {
				console.error('web3Gateway is not defined');
				return;
			}
			try {
				// TODO: convert usd to lmr (aggregate of exchanges?)
				const gasLimit = 1000000;
				const price = multiplyByDigits(formData.listPrice as number);
				let speed;
				if (formData && formData.speed) {
					speed = formData.speed * 10 ** 12;
				} else {
					speed = 0;
				}
				if (!formData.contractTime){
					console.error('missing contractTime');
					return;
				}
				const receipt = await web3Gateway.editContractTerms({
					contractAddress: contractId,
					price: String(price),
					speed: String(speed),
					length: String(formData.contractTime * 3600),
					profitTarget: '0',
					from: userAccount,
				});
				if (receipt?.status) {
					setContentState(ContentState.Complete);
				}

			} catch (error) {
				const typedError = error as Error;
				printError(typedError.message, typedError.stack as string);
				closeForm();
			}
		}

		// Completed
		if (contentState === ContentState.Complete) {
			closeForm();
		}
	};

	// Check if user is seller and contract is running
	useEffect(() => {
		let timeoutId: NodeJS.Timeout;
		if (isNoEditSeller(contract, userAccount)) {
			setAlertOpen(true);
			timeoutId = setTimeout(() => closeForm(), 3000);
		}

		return () => clearTimeout(timeoutId);
	}, []);

	// Create transaction when in pending state
	useEffect(() => {
		if (contentState === ContentState.Pending) editContractAsync(formData);
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
				content = <CompletedContent contentState={contentState} isEdit />;
				break;
			default:
				buttonContent = buttonText.edit as string;
				content = <ReviewContent register={register} errors={errors} data={formData} />;
		}
	};
	createContent();

	return (
		<Fragment>
			<Alert
				message={AlertMessage.NoEditSeller}
				isOpen={alertOpen}
				onClose={() => setAlertOpen(false)}
			/>
			<div
				className={`flex flex-col justify-center w-full min-w-21 max-w-32 sm:min-w-26 font-Inter font-medium`}
			>
				<div className='flex justify-between p-4 bg-white text-black border-transparent rounded-t-5'>
					<div
						className={
							contentState === ContentState.Complete || contentState === ContentState.Pending
								? 'hidden'
								: 'block'
						}
					>
						<p className='text-3xl'>Edit Contract</p>
						<p>Sell your hashpower on the Lumerin Marketplace</p>
					</div>
				</div>
				{content}
				<div className='flex gap-6 bg-white p-4 pt-14 rounded-b-5'>
					<button
						type='submit'
						className={`h-16 w-full py-2 px-4 btn-modal border-lumerin-aqua bg-white text-sm font-medium text-lumerin-aqua focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lumerin-aqua`}
						onClick={() => closeForm()}
					>
						Close
					</button>
					{contentState !== ContentState.Pending
						? getButton(contentState, buttonContent, () => {}, handleSubmit, !isValid)
						: null}
				</div>
			</div>
		</Fragment>
	);
};

EditForm.displayName = 'EditForm';
EditForm.whyDidYouRender = false;
