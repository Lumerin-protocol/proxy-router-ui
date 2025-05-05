/* eslint-disable react-hooks/exhaustive-deps */
import React, { Dispatch, Fragment, SetStateAction, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ReviewContent } from './ReviewContent';
import { ConfirmContent } from './ConfirmContent';
import { CompletedContent } from './CompletedContent';
import {
	getButton,
	printError,
	encryptMessage,
	truncateAddress,
	getPoolRfc2396,
	getHandlerBlockchainError,
	validateLightningUrl,
} from '../../../../utils';

import { ethers } from 'ethers';
import {
	AddressLength,
	AlertMessage,
	ContentState,
	ContractInfo,
	ContractState,
	FormData,
	HashRentalContract,
	InputValuesBuyForm,
	PathName,
	Validator,
} from '../../../../types';
import { Alert } from '../../Alert';
import { buttonText } from '../../../../shared';
import { divideByDigits } from '../../../../web3/helpers';
import { FormButtonsWrapper, SecondaryButton } from '../FormButtons/Buttons.styled';
import { purchasedHashrate } from '../../../../analytics';
import { ContractLink } from '../../Modal.styled';
import { Alert as AlertMUI } from '@mui/material';
import { useHistory } from 'react-router';
import { EthereumGateway } from '../../../../gateway/ethereum';
import { decompressPublicKey } from '../../../../gateway/utils';

export interface ErrorWithCode extends Error {
	code?: number;
}

// Used to set initial state for contentData to prevent undefined error
const initialFormData: FormData = {
	poolAddress: '',
	validatorAddress: '',
	portNumber: '',
	username: '',
	password: '',
	speed: '',
	price: '',
};

interface BuyFormProps {
	contracts: HashRentalContract[];
	contractId: string;
	userAccount: string;
	web3Gateway?: EthereumGateway;
	validators: Validator[];
	lumerinbalance: number;
	setOpen: Dispatch<SetStateAction<boolean>>;
}

export const BuyForm: React.FC<BuyFormProps> = ({
	contracts,
	contractId,
	userAccount,
	web3Gateway,
	lumerinbalance,
	validators,
	setOpen,
}) => {
	const [contentState, setContentState] = useState<string>(ContentState.Review);

	const [formData, setFormData] = useState<FormData>(initialFormData);
	const [alertOpen, setAlertOpen] = useState<boolean>(false);
	const [alertMessage, setAlertMessage] = useState<string>('');
	const [totalHashrate, setTotalHashrate] = useState<number>();
	const [purchasedTx, setPurchasedTx] = useState<string>('');
	const [usedLightningPayoutsFlow, setUsedLightningPayoutsFlow] = useState<boolean>(false);
	const history = useHistory();
	const [validatingUrl, setValidatingUrl] = useState(false);
	const [showValidationError, setShowValidationError] = useState(false);

	// Input validation setup
	const {
		register,
		clearErrors,
		formState: { errors, isValid },
		setValue,
		trigger,
	} = useForm<InputValuesBuyForm>({ mode: 'onBlur', reValidateMode: 'onBlur' });

	// Contract setup
	const contract = contracts.filter((contract) => contract.id === contractId)[0];

	// const getContractInfo: () => ContractInfo = () => {
	// 	setTotalHashrate(Number(contract.speed) * Number(contract.length));
	// 	return {
	// 		speed: contract.speed as string,
	// 		price: contract.price as string,
	// 		length: contract.length as string,
	// 		//TODO: test validity of this field in this context
	// 		version: contract.version as string,
	// 	};
	// };

	const handlePurchaseError = getHandlerBlockchainError(
		setAlertMessage,
		setAlertOpen,
		setContentState
	);

	const buyContractAsync = async (data: InputValuesBuyForm): Promise<void> => {
		if (contentState === ContentState.Review) {
			setContentState(ContentState.Confirm);
			setFormData({
				poolAddress: data.poolAddress,
				portNumber: data.portNumber,
				username: data.username,
				password: data.password,
				validatorAddress: data.validatorAddress,
			});
		}

		if (contentState === ContentState.Confirm) {
			setContentState(ContentState.Pending);
		}

		if (contentState === ContentState.Pending) {
			if (contract.price && lumerinbalance < divideByDigits(Number(contract.price))) {
				setAlertOpen(true);
				setAlertMessage(AlertMessage.InsufficientBalance);
				return;
			}

			try {
				if (!web3Gateway) {
					console.error('Web3 gateway is not available');
					return;
				}

				if (!formData) {
					console.error('Form data is not available');
					return;
				}

				const contractState = await web3Gateway.getContractState(contract.id);
				if (contractState !== ContractState.Available) {
					setAlertMessage(AlertMessage.ContractIsPurchased);
					setAlertOpen(true);
					setContentState(ContentState.Review);
					return;
				}

				const receipt = await web3Gateway.approvePayment(contract.price, userAccount);
				if (!receipt.status) {
					setAlertMessage(AlertMessage.ApprovePaymentFailed);
					setAlertOpen(true);
					setContentState(ContentState.Cancel);
					return;
				}

				const feeReceipt = await web3Gateway.approveFee(contract.fee, userAccount);
				if (!feeReceipt.status) {
					setAlertMessage(AlertMessage.ApproveFeeFailed);
					setAlertOpen(true);
					setContentState(ContentState.Cancel);
					return;
				}

				// Purchase contract
				try {
					const buyerDest: string = getPoolRfc2396(formData)!;

					const validator = validators.find((v) => v.addr === formData.validatorAddress);
					if (!validator) {
						console.error('Validator is not set');
						return;
					}

					const validatorPublicKey = decompressPublicKey(
						validator.pubKeyYparity,
						validator.pubKeyX as any
					);
					if (!validatorPublicKey) {
						console.error('Validator public key is not available');
						return;
					}

					const validatorAddr = ethers.utils.computeAddress(validatorPublicKey);
					const encrDestURL = (
						await encryptMessage(validatorPublicKey.slice(2), buyerDest)
					).toString('hex');
					console.log('encrDestURL', encrDestURL);
					const validatorURL: string = `stratum+tcp://:@${validator?.host}`;
					const pubKey = await web3Gateway.getContractPublicKey(contract.id);
					console.log('pubKey', pubKey);
					const encrValidatorURL = (await encryptMessage(pubKey, validatorURL)).toString('hex');
					console.log('encrValidatorURL', encrValidatorURL);

					const receipt = await web3Gateway.purchaseContract({
						contractAddress: contract.id,
						validatorAddress: validatorAddr,
						encrValidatorURL: encrValidatorURL,
						encrDestURL: encrDestURL,
						buyer: userAccount,
						termsVersion: contract.version,
					});

					if (!receipt.status) {
						setAlertMessage(AlertMessage.PurchaseFailed);
						setAlertOpen(true);
						setContentState(ContentState.Cancel);
						return;
					}
					setPurchasedTx(receipt.transactionHash);
					purchasedHashrate(totalHashrate!);
					setContentState(ContentState.Complete);
					localStorage.setItem(
						contractId,
						JSON.stringify({ poolAddress: formData.poolAddress, username: formData.username })
					);
				} catch (e) {
					const typedError = e as ErrorWithCode;
					printError(typedError.message, typedError.stack as string);
					handlePurchaseError(typedError);
				}
			} catch (error) {
				const typedError = error as ErrorWithCode;
				printError(typedError.message, typedError.stack as string);
				handlePurchaseError(typedError);
			}
		}
	};

	// Create transaction when in pending state
	useEffect(() => {
		if (contentState === ContentState.Pending) buyContractAsync(formData);
	}, [contentState]);

	// Content setup
	// Defaults to review state
	// Initialize variables since html elements need values on first render
	let buttonContent = '';
	let content = <div></div>;
	const createContent: () => void = () => {
		switch (contentState) {
			case ContentState.Confirm:
				buttonContent = buttonText.confirm as string;
				const validator = validators.find((v) => v.addr === formData.validatorAddress)?.host;
				content = <ConfirmContent data={formData} validator={validator} />;
				break;
			case ContentState.Pending:
			case ContentState.Complete:
				buttonContent = buttonText.completed as string;
				content = (
					<CompletedContent
						contentState={contentState}
						tx={purchasedTx}
						useLightningPayouts={usedLightningPayoutsFlow}
					/>
				);
				break;
			default:
				buttonContent = buttonText.review as string;
				content = (
					<ReviewContent
						register={register}
						errors={errors}
						setValue={setValue}
						setFormData={setFormData}
						inputData={formData}
						validators={validators}
						onUseLightningPayoutsFlow={(e) => {
							setUsedLightningPayoutsFlow(e);
							setShowValidationError(false);
							trigger('poolAddress');
							clearErrors();
						}}
						clearErrors={clearErrors}
						showValidationError={showValidationError}
					/>
				);
		}
	};
	createContent();

	const onSubmit = () => {
		setShowValidationError(false);
		if (usedLightningPayoutsFlow) {
			setValidatingUrl(true);
			validateLightningUrl(formData?.username).then((isValid) => {
				setValidatingUrl(false);
				if (isValid) {
					buyContractAsync(formData);
				} else {
					setShowValidationError(true);
				}
			});
			return;
		}
		buyContractAsync(formData);
	};

	// Set styles and button based on ContentState
	const display =
		contentState === ContentState.Pending || contentState === ContentState.Complete ? false : true;

	return (
		<Fragment>
			<Alert message={alertMessage} isOpen={alertOpen} onClose={() => setAlertOpen(false)} />
			{display && (
				<>
					<h2>Purchase Hashpower</h2>
					<p className='font-normal mb-3'>
						Enter the Pool Address, Port Number, and Username you are pointing the purchased
						hashpower to.
					</p>
					<ContractLink
						href={`${process.env.REACT_APP_ETHERSCAN_URL}${contract.id as string}`}
						target='_blank'
						rel='noreferrer'
					>
						Contract Address: {truncateAddress(contract.id as string, AddressLength.MEDIUM)}
					</ContractLink>
				</>
			)}
			{contentState === ContentState.Confirm && (
				<AlertMUI severity='warning' sx={{ margin: '3px 0' }}>
					Thank you for choosing the Lumerin Hashpower Marketplace. Click "Confirm Order" below. You
					will be prompted to approve a transaction through your wallet. Stand by for a second
					transaction. Once both transactions are confirmed, you will be redirected to view your
					orders.
				</AlertMUI>
			)}

			{content}

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
							history.push(PathName.BuyerHub);
						},
						() => onSubmit(),
						!isValid,
						validatingUrl
					)}
			</FormButtonsWrapper>
		</Fragment>
	);
};

BuyForm.displayName = 'BuyForm';
BuyForm.whyDidYouRender = false;
