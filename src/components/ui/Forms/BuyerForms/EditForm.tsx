import { Dispatch, Fragment, SetStateAction, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Contract } from 'web3-eth-contract';
import {
	AddressLength,
	AlertMessage,
	ContentState,
	ContractInfo,
	FormData,
	HashRentalContract,
	InputValuesBuyForm,
	Receipt,
} from '../../../../types';
import { AbiItem } from 'web3-utils';
import ImplementationContract from '../../../../contracts/Implementation.json';
import { classNames, formatToRfc2396, getButton, printError, toInputValuesBuyForm, truncateAddress } from '../../../../utils';
import { ConfirmContent } from './ConfirmContent';
import { CompletedContent } from './CompletedContent';
import { ReviewContent } from './ReviewContent';
import { Alert } from '../../Alert';
import Web3 from 'web3';
import { buttonText, paragraphText } from '../../../../shared';

// Set initial state to current contract values
const getFormData: (contract: HashRentalContract) => InputValuesBuyForm = (contract) => {
	return toInputValuesBuyForm(contract.encryptedPoolData as string);
};

interface EditFormProps {
	contracts: HashRentalContract[];
	contractId: string;
	userAccount: string;
	marketplaceContract: Contract | undefined;
	web3: Web3 | undefined;
	setOpen: Dispatch<SetStateAction<boolean>>;
}

export const EditForm: React.FC<EditFormProps> = ({ contracts, contractId, userAccount, marketplaceContract, web3, setOpen }) => {
	const contract = contracts.filter((contract) => contract.id === contractId)[0];

	const [buttonOpacity, setButtonOpacity] = useState<string>('25');
	const [contentState, setContentState] = useState<string>(ContentState.Review);
	const [formData, setFormData] = useState<FormData>(getFormData(contract));
	const [alertOpen, setAlertOpen] = useState<boolean>(false);

	// Input validation setup
	const {
		register,
		handleSubmit,
		formState: { errors, isValid },
	} = useForm<InputValuesBuyForm>({ mode: 'onBlur' });

	// Contract setup
	const getContractInfo: () => ContractInfo = () => {
		return {
			speed: contract.speed as string,
			price: contract.price as string,
		};
	};
	// Controls contentState and creating a transaction
	const editContractAsync: (data: InputValuesBuyForm) => void = async (data) => {
		// Review
		if (isValid && contentState === ContentState.Review) {
			setContentState(ContentState.Confirm);
			setFormData({
				poolAddress: data.poolAddress,
				portNumber: data.portNumber,
				username: data.username,
				password: data.password,
				withValidator: data.withValidator,
				...getContractInfo(),
			});
		}

		// Confirm
		if (isValid && contentState === ContentState.Confirm) {
			setContentState(ContentState.Pending);
		}

		// Pending
		if (isValid && contentState === ContentState.Pending) {
			// Order of events
			// 1. Purchase hashrental contract
			// 2. Transfer contract price (LMR) to escrow account
			// 3. Call setFundContract to put contract in running state

			try {
				const gasLimit = 1000000;
				// TODO: encrypt poolAddress, username, password
				const encryptedBuyerInput = formatToRfc2396(formData);
				// TODO: call edit function when it's added
				// if (receipt?.status) {
				// 	}
				// } else {
				// 	// TODO: purchase has failed so surface this to user
				// }
				setContentState(ContentState.Complete);
			} catch (error) {
				const typedError = error as Error;
				printError(typedError.message, typedError.stack as string);
				// crash app if can't communicate with contracts
				throw typedError;
			}
		}

		// Completed
		if (contentState === ContentState.Complete) setOpen(false);
	};

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
	// Defaults to review state
	// Initialize variables since html elements need values on first render
	let paragraphContent = '';
	let buttonContent = '';
	let content = <div></div>;
	const createContent: () => void = () => {
		switch (contentState) {
			case ContentState.Confirm:
				paragraphContent = paragraphText.confirm;
				buttonContent = buttonText.confirm;
				content = <ConfirmContent data={formData} />;
				break;
			case ContentState.Pending:
			case ContentState.Complete:
				buttonContent = buttonText.completed as string;
				content = <CompletedContent contentState={contentState} />;
				break;
			default:
				paragraphContent = paragraphText.review as string;
				buttonContent = buttonText.edit as string;
				content = <ReviewContent register={register} errors={errors} isEdit data={formData} />;
		}
	};
	createContent();

	// Set styles and button based on ContentState
	const display = contentState === ContentState.Pending || contentState === ContentState.Complete ? 'hidden' : 'block';
	const bgColor = contentState === ContentState.Complete || contentState === ContentState.Confirm ? 'bg-black' : 'bg-lumerin-aqua';

	return (
		<Fragment>
			<Alert message={AlertMessage.InsufficientBalance} open={alertOpen} setOpen={setAlertOpen} />
			<div className={`flex flex-col justify-center w-full font-Inter font-medium`} style={{ minWidth: '26rem', maxWidth: '32rem' }}>
				<div className='flex justify-between bg-white text-black modal-input-spacing pb-4 border-transparent rounded-t-5'>
					<div className={classNames(contentState === ContentState.Complete || contentState === ContentState.Pending ? 'hidden' : 'block')}>
						<p className='text-3xl'>Edit Order</p>
						<p className='font-normal pt-2'>Order ID: {truncateAddress(contract.id as string, AddressLength.MEDIUM)}</p>
					</div>
				</div>
				{content}
				<div className={`${display} bg-white px-10 pt-16 pb-4 sm:mx-auto text-sm`}>
					<p>{paragraphContent}</p>
				</div>
				<div className='flex gap-6 bg-white modal-input-spacing pb-8 rounded-b-5'>
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
