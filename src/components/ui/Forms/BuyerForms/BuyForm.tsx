/* eslint-disable react-hooks/exhaustive-deps */
import React, { Dispatch, Fragment, SetStateAction, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ReviewContent } from './ReviewContent';
import { ConfirmContent } from './ConfirmContent';
import { Contract } from 'web3-eth-contract';
import { CompletedContent } from './CompletedContent';
import { getButton, printError, toRfc2396, encryptMessage, truncateAddress, getCreationTxIDOfContract, getPublicKey } from '../../../../utils';
import LumerinContract from '../../../../contracts/Lumerin.json';
import ImplementationContract from '../../../../contracts/Implementation.json';
import { AbiItem } from 'web3-utils';
import {
	AddressLength,
	AlertMessage,
	ContentState,
	ContractInfo,
	ContractJson,
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
import { divideByDigits } from '../../../../web3/helpers';

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
	cloneFactoryContract: Contract | undefined;
	web3: Web3 | undefined;
	lumerinbalance: number;
	setOpen: Dispatch<SetStateAction<boolean>>;
}

export const BuyForm: React.FC<BuyFormProps> = ({ contracts, contractId, userAccount, cloneFactoryContract, web3, lumerinbalance, setOpen }) => {
	const [buttonOpacity, setButtonOpacity] = useState<string>('25');
	const [contentState, setContentState] = useState<string>(ContentState.Review);
	const [isAvailable, setIsAvailable] = useState<boolean>(true);
	const [formData, setFormData] = useState<FormData>(initialFormData);
	const [alertOpen, setAlertOpen] = useState<boolean>(false);

	/*
	 * This will need to be changed to the mainnet token 
	 * once we move over to mainnet
	 * including this comment in the hopes that this line of code will be easy to find
	 */
	const lumerinTokenAddress = '0x04fa90c64DAeEe83B22501c790D39B8B9f53878a';

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

			if (contract.price && lumerinbalance < divideByDigits(contract.price as number)) {
				setAlertOpen(true);
				setIsAvailable(true);
				return;
			}

			try {
				// const validatorFee = '100';
				const gasLimit = 1000000;
				let sendOptions: Partial<SendOptions> = { from: userAccount, gas: gasLimit };
				// if (formData.withValidator && web3) sendOptions.value = web3.utils.toWei(validatorFee, 'wei');

				if (web3 && formData) {
					// Check contract is available before increasing allowance
					const implementationContract = new web3.eth.Contract(ImplementationContract.abi as AbiItem[], contract.id as string);
					const contractState = await implementationContract.methods.contractState().call();
					if (contractState !== ContractState.Available) {
						setIsAvailable(false);
						setAlertOpen(true);
						return;
					}
// Approve clone factory contract to transfer LMR on buyer's behalf
					const lumerinTokenContract = new web3.eth.Contract(LumerinContract.abi as AbiItem[], lumerinTokenAddress);
					const receipt: Receipt = await lumerinTokenContract.methods
						.increaseAllowance(cloneFactoryContract?.options.address, formData.price)
						.send(sendOptions);
					if (receipt?.status) {
						// Purchase contract
						const buyerInput: string = toRfc2396(formData)!;
						let contractAddress = contract.id!
						const contractCreationTx = await getCreationTxIDOfContract(contractAddress.toString())
						const pubKey = await getPublicKey(contractCreationTx)
						const encryptedBuyerInput = await encryptMessage(pubKey,buyerInput);
						const receipt: Receipt = await cloneFactoryContract?.methods
               //.setPurchaseRentalContract(contract.id, encryptedBuyerInput) //commented out for testing
               .setPurchaseRentalContract(contract.id, buyerInput) //commented out for testing
               .send(sendOptions);
						console.log(`encrypted buyer input/ciphertext is: ${encryptedBuyerInput}`)
						//if (!receipt.status) {
						//	// TODO: purchasing contract has failed, surface to user
						//}
					} else {
						// TODO: call to increaseAllowance() has failed, surface to user
						console.log('increase allowance failed')
					}
				}
				setContentState(ContentState.Complete);
			} catch (error) {
				const typedError = error as Error;
				printError(typedError.message, typedError.stack as string);
				setOpen(false);
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
				paragraphContent = paragraphText.confirm as string;
				buttonContent = buttonText.confirm as string;
				content = <ConfirmContent web3={web3} data={formData} />;
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
		<Fragment>
			<Alert
				message={!isAvailable ? AlertMessage.ContractIsPurchased : AlertMessage.InsufficientBalance}
				open={alertOpen}
				setOpen={setAlertOpen}
			/>
			<div className={`flex flex-col justify-center w-full min-w-21 max-w-32 sm:min-w-26 font-Inter font-medium`}>
				<div className='flex justify-between bg-white text-black modal-input-spacing pb-4 border-transparent rounded-t-5'>
					<div className={contentState === ContentState.Complete || contentState === ContentState.Pending ? 'hidden' : 'block'}>
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
		</Fragment>
	);
};

BuyForm.displayName = 'BuyForm';
BuyForm.whyDidYouRender = false;
