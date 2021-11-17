/* eslint-disable react-hooks/exhaustive-deps */
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ReviewContent } from './ReviewContent';
import { ConfirmContent } from './ConfirmContent';
import { Contract } from 'web3-eth-contract';
import { CompletedContent } from './CompletedContent';
import { classNames, getButton, printError, truncateAddress } from '../../../utils';
import ImplementationContract from '../../../contracts/Implementation.json';
import { AbiItem } from 'web3-utils';
import { transferLumerinAsync } from '../../../web3/helpers';
import { AddressLength, ContentState, FormData, HashRentalContract, InputValuesBuyForm, Receipt, Text } from '../../../types';
import Web3 from 'web3';

interface ContractInfo {
	speed: string;
	price: string;
}

interface SendOptions {
	from: string;
	gas: number;
	value?: string;
}

// Form text setup
const paragraphText: Text = {
	review: 'Please enter a valid IP Address that is connected to your mining machine as well as the Port Number. Username and PW are optional.',
	confirm: 'Please review the following information below is correct. Once submitted, you will not be able to make any changes.',
};

const buttonText: Text = {
	review: 'Review Order',
	confirm: 'Confirm Order',
	completed: 'Close',
};

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

interface BuyFormProps {
	contracts: HashRentalContract[];
	contractId: string;
	userAccount: string;
	marketplaceContract: Contract | undefined;
	web3: Web3 | undefined;
	setOpen: Dispatch<SetStateAction<boolean>>;
}

export const BuyForm: React.FC<BuyFormProps> = ({ contracts, contractId, userAccount, marketplaceContract, web3, setOpen }) => {
	const [buttonOpacity, setButtonOpacity] = useState<string>('25');
	const [contentState, setContentState] = useState<string>(ContentState.Review);
	const [formData, setFormData] = useState<FormData>(initialFormData);

	// Input validation setup
	const {
		register,
		handleSubmit,
		formState: { errors, isValid },
	} = useForm<InputValuesBuyForm>({ mode: 'onBlur' });

	// Contract setup
	const contract = contracts.filter((contract) => contract.id === contractId)[0];
	const getContractInfo: () => ContractInfo = () => {
		return {
			speed: contract.speed as string,
			price: contract.price as string,
		};
	};
	// Controls contentState and creating a transaction
	const buyContractAsync: (data: InputValuesBuyForm) => void = async (data) => {
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
				// TODO: update with actual validator address and validator fee
				const validator = formData.withValidator
					? '0xD12b787E2F318448AE2Fd04e51540c9cBF822e89'
					: '0x0000000000000000000000000000000000000000';
				const validatorFee = '100';
				const gasLimit = 1000000;
				let sendOptions: Partial<SendOptions> = { from: userAccount, gas: gasLimit };
				if (formData.withValidator && web3) sendOptions.value = web3.utils.toWei(validatorFee, 'wei');
				// TODO: encrypt poolAddress, username, password
				const encryptedBuyerInput = `${formData.poolAddress}|${formData.portNumber}|${formData.username}|${formData.password}`;
				const receipt: Receipt = await marketplaceContract?.methods
					.setPurchaseContract(contract.id, userAccount, validator, formData.withValidator, encryptedBuyerInput)
					.send(sendOptions);
				if (receipt?.status) {
					// Fund the escrow account which is same address as hashrental contract
					if (web3) {
						const receipt: Receipt = await transferLumerinAsync(web3, userAccount, contract.id as string, contract.price as number);
						if (receipt.status) {
							// Call setFundContract() to put contract in running state
							const implementationContractInstance = new web3.eth.Contract(
								ImplementationContract.abi as AbiItem[],
								contract.id as string
							);
							const receipt: Receipt = await implementationContractInstance.methods
								.setFundContract()
								.send({ from: userAccount, gas: gasLimit });
							if (!receipt.status) {
								// TODO: funding failed so surface this to user
							}
						} else {
							// TODO: transfer has failed so surface this to user
						}
					}
				} else {
					// TODO: purchase has failed so surface this to user
				}
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
		if (contentState === ContentState.Pending) buyContractAsync(formData);
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
				buttonContent = buttonText.review as string;
				content = <ReviewContent register={register} errors={errors} />;
		}
	};
	createContent();

	// Set styles and button based on ContentState
	const display = contentState === ContentState.Pending || contentState === ContentState.Complete ? 'hidden' : 'block';
	const bgColor = contentState === ContentState.Complete || contentState === ContentState.Confirm ? 'bg-black' : 'bg-lumerin-aqua';

	return (
		<div className={`flex flex-col justify-center w-full font-Inter font-medium`} style={{ minWidth: '26rem', maxWidth: '32rem' }}>
			<div className='flex justify-between bg-white text-black modal-input-spacing pb-4 border-transparent rounded-t-5'>
				<div className={classNames(contentState === ContentState.Complete || contentState === ContentState.Pending ? 'hidden' : 'block')}>
					<p className='text-3xl'>Purchase Hashpower</p>
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
					? getButton(contentState, bgColor, buttonOpacity, buttonContent, setOpen, handleSubmit, buyContractAsync)
					: null}
			</div>
		</div>
	);
};

BuyForm.displayName = 'BuyForm';
BuyForm.whyDidYouRender = false;
