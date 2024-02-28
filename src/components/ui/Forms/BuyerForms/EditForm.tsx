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
	PathName,
	Receipt,
	UpdateFormProps,
} from '../../../../types';
import { AbiItem } from 'web3-utils';
import { ImplementationContract } from 'contracts-js';
import {
	getPoolRfc2396,
	getButton,
	isNoEditBuyer,
	printError,
	truncateAddress,
	getValidatorPublicKey,
	encryptMessage,
	getValidatorURL,
	getHandlerBlockchainError,
} from '../../../../utils';
import { ConfirmContent } from './ConfirmContent';
import { CompletedContent } from './CompletedContent';
import { ReviewContent } from './ReviewContent';
import { Alert } from '../../Alert';
import { buttonText, paragraphText } from '../../../../shared';
import { FormButtonsWrapper, SecondaryButton } from '../FormButtons/Buttons.styled';
import { ContractLink } from '../../Modal.styled';
import { getGasConfig } from '../../../../web3/helpers';
import { useHistory } from 'react-router';

// Used to set initial state for contentData to prevent undefined error
const initialFormData: FormData = {
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
	const [alertMessage, setAlertMessage] = useState<string>('');
	const [usedLightningPayoutsFlow, setUsedLightningPayoutsFlow] = useState<boolean>(false);
	const history = useHistory();

	const handleEditError = getHandlerBlockchainError(setAlertMessage, setAlertOpen, setContentState);

	// Input validation setup
	const {
		register,
		handleSubmit,
		clearErrors,
		formState: { errors, isValid },
		setValue,
		trigger,
	} = useForm<InputValuesBuyForm>({ mode: 'onBlur', reValidateMode: 'onBlur' });

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
					const gasPrice = await web3.eth.getGasPrice();
					const implementationContract = new web3.eth.Contract(
						ImplementationContract.abi as AbiItem[],
						contract.id as string
					);
					const sendOptions = {
						...getGasConfig(gasPrice),
						from: userAccount,
					};

					const buyerDest: string = getPoolRfc2396(formData)!;

					const validatorPublicKey = (await getValidatorPublicKey()) as string;

					const encryptedBuyerInput = (
						await encryptMessage(validatorPublicKey.slice(2), buyerDest)
					).toString('hex');

					const validatorAddress: string = `stratum+tcp://:@${getValidatorURL()}`;

					const pubKey = await implementationContract.methods.pubKey().call();

					let validatorEncr = (await encryptMessage(`04${pubKey}`, validatorAddress)).toString(
						'hex'
					);

					const updateDestGas = await implementationContract?.methods
						.setDestination(validatorEncr, encryptedBuyerInput)
						.estimateGas({
							...sendOptions,
						});

					const receipt: Receipt = await implementationContract.methods
						.setDestination(validatorEncr, encryptedBuyerInput)
						.send({
							...sendOptions,
							gas: updateDestGas,
						});
					if (receipt?.status) {
						setContentState(ContentState.Complete);
						localStorage.setItem(
							contractId,
							JSON.stringify({ poolAddress: formData.poolAddress, username: formData.username })
						);
					} else {
						setAlertMessage(AlertMessage.EditFailed);
						setAlertOpen(true);
						setContentState(ContentState.Cancel);
					}
				}
			} catch (error) {
				const typedError = error as Error;
				printError(typedError.message, typedError.stack as string);
				handleEditError(typedError);
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
			setAlertMessage(AlertMessage.NoEditBuyer);
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
				content = (
					<CompletedContent
						contentState={contentState}
						isEdit
						useLightningPayouts={usedLightningPayoutsFlow}
					/>
				);
				break;
			default:
				paragraphContent = paragraphText.review as string;
				buttonContent = buttonText.edit as string;
				content = (
					<ReviewContent
						register={register}
						errors={errors}
						buyerString={contract.encryptedPoolData}
						isEdit={true}
						inputData={formData}
						setFormData={setFormData}
						clearErrors={clearErrors}
						onUseLightningPayoutsFlow={(e) => {
							setUsedLightningPayoutsFlow(e);
							trigger('poolAddress');
							clearErrors();
						}}
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
			<Alert message={alertMessage} isOpen={alertOpen} onClose={() => setAlertOpen(false)} />
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
					getButton(
						contentState,
						buttonContent,
						() => {
							setOpen(false);
							history.push(PathName.MyOrders);
						},
						() => editContractAsync(formData),
						!isValid
					)}
			</FormButtonsWrapper>
		</Fragment>
	);
};

EditForm.displayName = 'EditForm';
EditForm.whyDidYouRender = false;
