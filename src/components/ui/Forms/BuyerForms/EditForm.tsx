/* eslint-disable react-hooks/exhaustive-deps */
import { Fragment, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
	AddressLength,
	AlertMessage,
	ContentState,
	ContractInfo,
	FormData,
	InputValuesBuyForm,
	Receipt,
	UpdateFormProps,
} from '../../../../types';
import { AbiItem } from 'web3-utils';
import { ImplementationContract } from 'contracts-js';
import {
	toRfc2396,
	getButton,
	isNoEditBuyer,
	printError,
	truncateAddress,
} from '../../../../utils';
import { ConfirmContent } from './ConfirmContent';
import { CompletedContent } from './CompletedContent';
import { ReviewContent } from './ReviewContent';
import { Alert } from '../../Alert';
import { buttonText, paragraphText } from '../../../../shared';
import { FormButtonsWrapper, SecondaryButton } from '../FormButtons/Buttons.styled';
import { ContractLink } from '../../Modal.styled';

// Used to set initial state for contentData to prevent undefined error
const initialFormData: FormData = {
	withValidator: false,
	poolAddress: '',
	portNumber: '',
	username: '',
	password: '',
	speed: '',
	price: '',
};
export const EditForm: React.FC<UpdateFormProps> = ({
	contracts,
	contractId,
	userAccount,
	web3,
	setOpen,
}) => {
	const contract = contracts.filter((contract) => contract.id === contractId)[0];

	const [contentState, setContentState] = useState<string>(ContentState.Review);
	const [formData, setFormData] = useState<FormData>(initialFormData);
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
			length: contract.length as string,
		};
	};

	// Controls contentState and creating a transaction
	const editContractAsync: (data: InputValuesBuyForm) => void = async (data) => {
		if (isNoEditBuyer(contract, userAccount)) return;

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
			try {
				if (web3) {
					const gasLimit = 1000000;
					// TODO: encrypt poolAddress, username, password
					const encryptedBuyerInput = toRfc2396(formData);
					const implementationContract = new web3.eth.Contract(
						ImplementationContract.abi as AbiItem[],
						contract.id as string
					);
					const receipt: Receipt = await implementationContract.methods
						.setUpdateMiningInformation(encryptedBuyerInput)
						.send({ from: userAccount, gas: gasLimit });
					if (receipt?.status) {
						setContentState(ContentState.Complete);
					} else {
						// TODO: edit has failed, surface this to user
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

	// Check if user is buyer and contract is running
	useEffect(() => {
		let timeoutId: NodeJS.Timeout;
		if (isNoEditBuyer(contract, userAccount)) {
			setAlertOpen(true);
			timeoutId = setTimeout(() => setOpen(false), 3000);
		}

		return () => clearTimeout(timeoutId);
	}, []);

	// Create transaction when in pending state
	useEffect(() => {
		if (contentState === ContentState.Pending) editContractAsync(formData);
	}, [contentState]);

	useEffect(() => {
		console.log({ contract: contract });
		console.log(contentState);
	});

	// Content setup
	// Defaults to review state
	// Initialize variables since html elements need values on first render
	let paragraphContent = '';
	let buttonContent = '';
	let content = <div></div>;
	const createContent: () => void = () => {
		switch (contentState) {
			case ContentState.Confirm:
				paragraphContent = paragraphText.confirm as string;
				buttonContent = buttonText.confirmChanges as string;
				content = <ConfirmContent web3={web3} data={formData} />;
				break;
			case ContentState.Pending:
			case ContentState.Complete:
				buttonContent = buttonText.completed as string;
				content = <CompletedContent contentState={contentState} isEdit />;
				break;
			default:
				paragraphContent = paragraphText.review as string;
				buttonContent = buttonText.edit as string;
				content = (
					<ReviewContent
						register={register}
						errors={errors}
						buyerString={contract.encryptedPoolData}
						isEdit
					/>
				);
		}
	};
	createContent();

	// Set styles and button based on ContentState
	const display =
		contentState === ContentState.Pending || contentState === ContentState.Complete ? false : true;

	return (
		<Fragment>
			<Alert
				message={AlertMessage.NoEditBuyer}
				isOpen={alertOpen}
				onClose={() => setAlertOpen(false)}
			/>
			{display && (
				<>
					<h2>Edit Order</h2>
					<ContractLink
						href={`${process.env.REACT_APP_ETHERSCAN_URL}${contract.id as string}`}
						target='_blank'
						rel='noreferrer'
					>
						Contract Address: {truncateAddress(contract.id as string, AddressLength.MEDIUM)}
					</ContractLink>
				</>
			)}
			{content}
			{display && <p className='subtext'>{paragraphContent}</p>}
			<FormButtonsWrapper>
				<SecondaryButton type='submit' onClick={() => setOpen(false)}>
					Close
				</SecondaryButton>
				{contentState !== ContentState.Pending &&
					getButton(contentState, buttonContent, setOpen, handleSubmit)}
			</FormButtonsWrapper>
		</Fragment>
	);
};

EditForm.displayName = 'EditForm';
EditForm.whyDidYouRender = false;
