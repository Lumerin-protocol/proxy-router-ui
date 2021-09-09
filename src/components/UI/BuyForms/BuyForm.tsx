import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { classNames, truncateAddress } from '../../../utils';
import { ReviewContent } from './ReviewContent';
import { ConfirmContent } from './ConfirmContent';
import { HashRentalContract } from '../../Main';
import { Contract } from 'web3-eth-contract';
import { CompletedContent } from './CompletedContent';
import { Link } from 'react-router-dom';
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

interface TextType {
	review: string;
	confirm: string;
	completed?: string;
}

const orderText: TextType = {
	review: 'My Order',
	confirm: 'Confirm Order',
	completed: 'Order Complete',
};

const paragraphText: TextType = {
	review: 'Please enter a valid IP Address that is connected to your mining machine as well as the Port Number. Username and PW are optional.',
	confirm:
		'Please review the following information below is correct. Once submitted, you will not be able to make any changes. Click the contract address above to see the contract on etherscan.',
};

const buttonText: TextType = {
	review: 'Review Order',
	confirm: 'Confirm Order',
	completed: 'Close',
};

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

	// input validation setup
	const {
		register,
		handleSubmit,
		formState: { errors, isValid },
	} = useForm<InputValues>({ mode: 'onBlur' });

	interface ContractInfo {
		limit: string;
		speed: number;
		price: string;
	}

	const contract = contracts.filter((contract) => contract.id === contractId)[0];
	const getContractInfo: () => ContractInfo = () => {
		return {
			limit: contract.limit as string,
			speed: contract.speed as number,
			price: contract.price as string,
		};
	};
	const buyContract: (data: InputValues) => void = async (data) => {
		// review
		if (isValid && contentState === ContentState.review) {
			setContentState(ContentState.confirm);
			setFormData({
				poolAddress: data.poolAddress,
				username: data.username,
				password: data.password,
				...getContractInfo(),
			});
		}

		// confirm
		if (isValid && contentState === ContentState.confirm) {
			setContentState(ContentState.completed);
			try {
				const receipt = await marketplaceContract?.methods
					.setBuyContract(contract.id, data.poolAddress, data.username, data.password)
					.send({ from: userAccount, value: web3?.utils.toWei(contract.price as string, 'ether') });
				console.log(receipt);
			} catch (error) {
				console.log(error);
				throw new Error((error as Error).message);
			}
		}

		// completed
		if (contentState === ContentState.completed) setOpen(false);
	};

	// check if input is valid
	useEffect(() => {
		if (isValid) {
			setButtonOpacity('100');
		} else {
			setButtonOpacity('25');
		}
	}, [isValid]);

	// content setup
	// defaults to review state
	let orderContent = orderText.review;
	let paragraphContent = paragraphText.review;
	let buttonContent = buttonText.review;
	let content = <ReviewContent register={register} errors={errors} />;
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
		}
	};
	createContent();

	const maxWidth = contentState === ContentState.review ? 'lg' : 'sm';
	const display = contentState === ContentState.completed ? 'hidden' : 'block';
	const bgColor = contentState === ContentState.completed ? 'bg-lumerin-aqua' : 'bg-black';

	return (
		// TODO: figure out why max-length isn't working when deployed
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
							? 'h-16 w-full flex justify-center items-center py-2 px-4 mb-4 border border-transparent rounded-5 shadow-sm text-sm font-medium text-white bg-black hover:bg-lumerin-aqua focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lumerin-aqua'
							: 'hidden'
					)}
					onClick={() => setOpen(false)}
				>
					<span>View Orders</span>
				</Link>
				<button
					type='submit'
					className={`h-16 w-full py-2 px-4 border border-transparent rounded-5 shadow-sm text-sm font-medium text-white ${bgColor} bg-opacity-${buttonOpacity} hover:bg-lumerin-aqua focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lumerin-aqua`}
					style={{ opacity: buttonOpacity === '25' ? '.25' : '1' }} // TODO: figure out why tailwind opacity not working in prod
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
