import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ReviewContent } from './ReviewContent';
import { ConfirmContent } from './ConfirmContent';
import { HashRentalContract } from '../../Main';
import { Contract } from 'web3-eth-contract';
import { CompletedContent } from './CompletedContent';
import { classNames, printError, truncateAddress } from '../../../utils';
import Web3 from 'web3';

// making fields optional bc a user might not have filled out the input fields
// when useForm() returns the error object that's typed against InputValues
export interface InputValues {
	poolAddress?: string;
	username?: string;
	password?: string;
}

export interface FormData extends InputValues {
	limit: string;
	speed: number;
	price: string;
}

enum ContentState {
	review = 'review',
	confirm = 'confirm',
	completed = 'completed',
}

interface Text {
	review: string;
	confirm: string;
	completed?: string;
}

// Form text setup
const orderText: Text = {
	review: 'My Order',
	confirm: 'Confirm Order',
	completed: 'Order Complete',
};

const paragraphText: Text = {
	review: 'Please enter a valid IP Address that is connected to your mining machine as well as the Port Number. Username and PW are optional.',
	confirm:
		'Please review the following information below is correct. Once submitted, you will not be able to make any changes. Click the contract address above to see the contract on etherscan.',
};

const buttonText: Text = {
	review: 'Review Order',
	confirm: 'Confirm Order',
	completed: 'Close',
};

interface ContractInfo {
	limit: string;
	speed: number;
	price: string;
}

// Used to set initial state for contentData to prevent undefined error
const initialFormData: FormData = {
	poolAddress: '',
	username: '',
	password: '',
	limit: '',
	speed: 0,
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
	const [contentState, setContentState] = useState<string>(ContentState.review);
	const [formData, setFormData] = useState<FormData>(initialFormData);

	// Input validation setup
	const {
		register,
		handleSubmit,
		formState: { errors, isValid },
	} = useForm<InputValues>({ mode: 'onBlur' });

	// Contract setup
	const contract = contracts.filter((contract) => contract.id === contractId)[0];
	const getContractInfo: () => ContractInfo = () => {
		return {
			limit: contract.limit as string,
			speed: contract.speed as number,
			price: contract.price as string,
		};
	};
	// Controls contentState and creating a transaction
	const buyContract: (data: InputValues) => void = async (data) => {
		// Review
		if (isValid && contentState === ContentState.review) {
			setContentState(ContentState.confirm);
			setFormData({
				poolAddress: data.poolAddress,
				username: data.username,
				password: data.password,
				...getContractInfo(),
			});
		}

		// Confirm
		if (isValid && contentState === ContentState.confirm) {
			try {
				const receipt = await marketplaceContract?.methods
					.setBuyContract(contract.id, data.poolAddress, data.username, data.password)
					.send({ from: userAccount, value: web3?.utils.toWei(contract.price as string, 'ether') });
				if (receipt?.status) setContentState(ContentState.completed);
			} catch (error) {
				const typedError = error as Error;
				printError(typedError.message, typedError.stack as string);
				// crash app if can't communicate with webfacing contract
				throw typedError;
			}
		}

		// Completed
		if (contentState === ContentState.completed) setOpen(false);
	};

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
	let orderContent = '';
	let paragraphContent = '';
	let buttonContent = '';
	let content = <div></div>;
	const createContent: () => void = () => {
		switch (contentState) {
			case ContentState.confirm:
				orderContent = orderText.confirm;
				paragraphContent = paragraphText.confirm;
				buttonContent = buttonText.confirm;
				content = <ConfirmContent data={formData} />;
				break;
			case ContentState.completed:
				orderContent = orderText.completed as string;
				buttonContent = buttonText.completed as string;
				content = <CompletedContent />;
				break;
			default:
				orderContent = orderText.review;
				paragraphContent = paragraphText.review;
				buttonContent = buttonText.review;
				content = <ReviewContent register={register} errors={errors} />;
		}
	};
	createContent();

	// Set styles based on ContentState
	const maxWidth = contentState === ContentState.review ? 'lg' : 'sm';
	const display = contentState === ContentState.completed ? 'hidden' : 'block';
	const bgColor = contentState === ContentState.completed ? 'bg-lumerin-aqua' : 'bg-black';

	return (
		<div className={`flex flex-col justify-center w-full max-w-${maxWidth} font-Inter font-medium`} style={{ maxWidth: '32rem' }}>
			<div className='flex justify-between bg-lumerin-aqua p-4 border-transparent rounded-t-5'>
				<div className='text-white'>
					<p className='text-lg'>Purchase Hashpower</p>
					<p className='text-sm'>{orderContent}</p>
				</div>
				<div className='flex flex-col items-end text-white hover:text-lumerin-light-aqua'>
					<a href={`https://etherscan.io/address/${contract.id}`} target='_blank' rel='noreferrer'>
						<p className='text-lg'>Contract Address</p>
						<p className='text-sm'>{truncateAddress(contract.id as string)}</p>
					</a>
				</div>
			</div>
			<div className={`${display} bg-white p-4 sm:mx-auto text-sm`}>
				<p>{paragraphContent}</p>
			</div>
			{content}
			<div className='flex flex-col bg-white p-4 pt-14 rounded-b-5'>
				<Link
					to='/myorders'
					className={classNames(
						contentState === ContentState.completed
							? 'h-16 w-full flex justify-center items-center py-2 px-4 mb-4 btn-buy-modal text-sm font-medium text-white bg-black hover:bg-lumerin-aqua focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lumerin-aqua'
							: 'hidden'
					)}
					onClick={() => setOpen(false)}
				>
					<span>View Orders</span>
				</Link>
				<button
					type='submit'
					className={`h-16 w-full py-2 px-4 btn-buy-modal text-sm font-medium text-white ${bgColor} hover:bg-lumerin-aqua focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lumerin-aqua`}
					style={{ opacity: buttonOpacity === '25' ? '.25' : '1' }}
					onClick={handleSubmit((data) => buyContract(data))}
				>
					{buttonContent}
				</button>
			</div>
		</div>
	);
};

BuyForm.displayName = 'BuyForm';
BuyForm.whyDidYouRender = false;
