/* eslint-disable react-hooks/exhaustive-deps */
import React, { Dispatch, Fragment, SetStateAction, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ReviewContent } from './ReviewContent';
import { ConfirmContent } from './ConfirmContent';
import { Contract } from 'web3-eth-contract';
import { CompletedContent } from './CompletedContent';
import {
	getButton,
	printError,
	encryptMessage,
	truncateAddress,
	getCreationTxIDOfContract,
	getPublicKey,
	getValidatorPublicKey,
	getPoolRfc2396,
	getValidatorRfc2396,
	getValidatorURL,
	getHandlerBlockchainError,
} from '../../../../utils';

import { LumerinContract, ImplementationContract } from 'contracts-js';

import { AbiItem } from 'web3-utils';
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
	Receipt,
	SendOptions,
} from '../../../../types';
import { Alert } from '../../Alert';
import Web3 from 'web3';
import { buttonText, paragraphText } from '../../../../shared';
import { divideByDigits, getGasConfig } from '../../../../web3/helpers';
import { FormButtonsWrapper, SecondaryButton } from '../FormButtons/Buttons.styled';
import { purchasedHashrate } from '../../../../analytics';
import { ContractLink } from '../../Modal.styled';
import { Alert as AlertMUI } from '@mui/material';

interface ErrorWithCode extends Error {
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
	cloneFactoryContract: Contract | undefined;
	web3: Web3 | undefined;
	lumerinbalance: number;
	setOpen: Dispatch<SetStateAction<boolean>>;
}

export const BuyForm: React.FC<BuyFormProps> = ({
	contracts,
	contractId,
	userAccount,
	cloneFactoryContract,
	web3,
	lumerinbalance,
	setOpen,
}) => {
	const [contentState, setContentState] = useState<string>(ContentState.Review);

	const [formData, setFormData] = useState<FormData>(initialFormData);
	const [alertOpen, setAlertOpen] = useState<boolean>(false);
	const [alertMessage, setAlertMessage] = useState<string>('');
	const [totalHashrate, setTotalHashrate] = useState<number>();
	const [purchasedTx, setPurchasedTx] = useState<string>('');
	const [usedLightningPayoutsFlow, setUsedLightningPayoutsFlow] = useState<boolean>(false);

	/*
	 * This will need to be changed to the mainnet token
	 * once we move over to mainnet
	 * including this comment in the hopes that this line of code will be easy to find
	 * TODO import this from web3/utils
	 */
	const lumerinTokenAddress = process.env.REACT_APP_LUMERIN_TOKEN_ADDRESS;

	// Input validation setup
	const {
		register,
		handleSubmit,
		clearErrors,
		formState: { errors, isValid },
		setValue,
	} = useForm<InputValuesBuyForm>({ mode: 'onBlur' });

	// Contract setup
	const contract = contracts.filter((contract) => contract.id === contractId)[0];
	const getContractInfo: () => ContractInfo = () => {
		setTotalHashrate(Number(contract.speed) * Number(contract.length));
		return {
			speed: contract.speed as string,
			price: contract.price as string,
			length: contract.length as string,
			//TODO: test validity of this field in this context
			version: contract.version as string,
		};
	};

	const handlePurchaseError = getHandlerBlockchainError(
		setAlertMessage,
		setAlertOpen,
		setContentState
	);

	const buyContractAsync: (data: InputValuesBuyForm) => void = async (data) => {
		// Review
		// if (isValid && contentState === ContentState.Review) {
		if (contentState === ContentState.Review) {
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
		// if (isValid && contentState === ContentState.Confirm) {
		if (contentState === ContentState.Confirm) {
			setContentState(ContentState.Pending);
		}

		// Pending
		// if (isValid && contentState === ContentState.Pending) {
		if (contentState === ContentState.Pending) {
			// Order of events
			// 1. Purchase hashrental contract
			// 2. Transfer contract price (LMR) to escrow account
			// 3. Call setFundContract to put contract in running state

			if (contract.price && lumerinbalance < divideByDigits(contract.price as number)) {
				setAlertOpen(true);
				setAlertMessage(AlertMessage.InsufficientBalance);
				return;
			}

			try {
				const sendOptions: Partial<SendOptions> = { 
					from: userAccount, 
					...getGasConfig(),
				};
				// if (formData.withValidator && web3) sendOptions.value = web3.utils.toWei(validatorFee, 'wei');

				if (web3 && formData) {
					// Check contract is available before increasing allowance
					const implementationContract = new web3.eth.Contract(
						ImplementationContract.abi as AbiItem[],
						contract.id as string
					);
					const contractState = await implementationContract.methods.contractState().call();
					if (contractState !== ContractState.Available) {
						setAlertMessage(AlertMessage.ContractIsPurchased);
						setAlertOpen(true);
						setContentState(ContentState.Review);
						return;
					}

					// Approve clone factory contract to transfer LMR on buyer's behalf
					const lumerinTokenContract = new web3.eth.Contract(
						LumerinContract.abi as AbiItem[],
						lumerinTokenAddress
					);
					const receipt: Receipt = await lumerinTokenContract.methods
						.increaseAllowance(cloneFactoryContract?.options.address, formData.price)
						.send(sendOptions);

					if (!receipt.status) {
						setAlertMessage('Failed to approve LMR transfer');
						setAlertOpen(true);
						setContentState(ContentState.Cancel);
						return;
					}
					// Purchase contract
					try {
						const buyerDest: string = getPoolRfc2396(formData)!;

						const validatorPublicKey = (await getValidatorPublicKey()) as string;
						const ethAddress = ethers.utils.computeAddress(validatorPublicKey);
						const encryptedBuyerInput = (
							await encryptMessage(validatorPublicKey.slice(2), buyerDest)
						).toString('hex');

						const validatorAddress: string = `stratum+tcp://:@${getValidatorURL()}`;

						const pubKey = await implementationContract.methods.pubKey().call();
						const validatorEncr = (await encryptMessage(`04${pubKey}`, validatorAddress)).toString(
							'hex'
						);

						const marketplaceFee = await cloneFactoryContract?.methods.marketplaceFee().call();

						const purchaseGas = await cloneFactoryContract?.methods
							.setPurchaseRentalContractV2(
								contractId,
								ethAddress,
								validatorEncr,
								encryptedBuyerInput,
								contract.version
							)
							.estimateGas({
								...sendOptions,
								value: marketplaceFee,
							});

						console.log('submitting purchase for contract: ', contract);
						const receipt: Receipt = await cloneFactoryContract?.methods
							.setPurchaseRentalContractV2(
								contractId,
								ethAddress,
								validatorEncr,
								encryptedBuyerInput,
								contract.version
							)
							.send({
								...sendOptions,
								gas: purchaseGas,
								value: marketplaceFee,
							});

						if (!receipt.status) {
							setAlertMessage(AlertMessage.IncreaseAllowanceFailed);
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
	let paragraphContent = '';
	let buttonContent = '';
	let content = <div></div>;
	const createContent: () => void = () => {
		switch (contentState) {
			case ContentState.Confirm:
				paragraphContent = paragraphText.confirm as string;
				buttonContent = buttonText.confirm as string;
				content = <ConfirmContent web3={web3} data={formData} />;
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
				paragraphContent = paragraphText.review as string;
				buttonContent = buttonText.review as string;
				content = (
					<ReviewContent
						register={register}
						errors={errors}
						setValue={setValue}
						setFormData={setFormData}
						inputData={formData}
						onUseLightningPayoutsFlow={setUsedLightningPayoutsFlow}
						clearErrors={clearErrors}
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
			{contentState !== ContentState.Complete && (
				<AlertMUI severity='warning' sx={{ margin: '3px 0' }}>
					Thank you for choosing the Lumerin Hashpower Marketplace. Click "Review Order" below. You
					will be prompted to approve a transaction through your wallet. Stand by for a second
					transaction. Once both transactions are confirmed, you will be redirected to view your
					orders.
				</AlertMUI>
			)}

			{content}

			{/* {display && <p className='subtext'>{paragraphContent}</p>} */}
			<FormButtonsWrapper>
				<SecondaryButton type='submit' onClick={() => setOpen(false)}>
					Close
				</SecondaryButton>
				{contentState !== ContentState.Pending &&
					getButton(
						contentState,
						buttonContent,
						setOpen,
						() => buyContractAsync(formData),
						!isValid
					)}
			</FormButtonsWrapper>
		</Fragment>
	);
};

BuyForm.displayName = 'BuyForm';
BuyForm.whyDidYouRender = false;
