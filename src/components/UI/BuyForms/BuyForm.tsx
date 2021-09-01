import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { classNames, truncateAddress } from '../../../utils';
import _ from 'lodash';
import { ReviewContent } from './ReviewContent';
import { ConfirmContent } from './ConfirmContent';
import { HashRentalContract } from '../../Main';

export interface InputValues {
	ipAddress: string;
	portNumber: number;
	username: string;
	password: string;
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
	completed: string;
}

const orderText: TextType = {
	review: 'My Order',
	confirm: 'Confirm Order',
	completed: 'Order Complete',
};

const paragraphText: TextType = {
	review: 'Please enter a valid IP Address that is connected to your mining machine as well as the Port Number. Username and PW are optional.',
	confirm: 'Please review the following information below is correct. Once submitted, you will not be able to make any changes.',
	completed: '',
};

const buttonText: TextType = {
	review: 'Review Order',
	confirm: 'Confirm Order',
	completed: 'Close',
};

const initialFormData: FormData = {
	ipAddress: '',
	portNumber: 0,
	username: '',
	password: '',
	limit: '',
	speed: 0,
	price: '',
};

interface BuyFormProps {
	contracts: HashRentalContract[];
	contractId: string;
}

export const BuyForm: React.FC<BuyFormProps> = ({ contracts, contractId }) => {
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
	const getContractInfo: () => ContractInfo = () => {
		const contract = contracts.filter((contract) => contract.id === contractId)[0];

		return {
			limit: contract.limit as string,
			speed: contract.speed as number,
			price: contract.price as string,
		};
	};
	const buyContract: (data: InputValues) => void = (data) => {
		if (isValid) {
			setContentState(ContentState.confirm);
			setFormData({
				ipAddress: data.ipAddress,
				portNumber: data.portNumber,
				username: data.username,
				password: data.password,
				...getContractInfo(),
			});
		}
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
				orderContent = orderText.completed;
				buttonContent = buttonText.completed;
				content = <div>Confirm</div>;
				break;
		}
	};
	createContent();

	return (
		<div className='flex flex-col justify-center font-Inter font-medium'>
			<div className='flex justify-between bg-lumerin-aqua p-4 border-transparent rounded-t-5'>
				<div className='text-white'>
					<p className='text-lg'>Purchase Hashpower</p>
					<p className='text-sm'>{orderContent}</p>
				</div>
				<div className='flex flex-col items-end text-white'>
					<p className='text-lg'>Order ID</p>
					<p className='text-sm'>{truncateAddress('123456789101112131415')}</p>
				</div>
			</div>
			<div className='bg-white p-4 sm:mx-auto sm:w-full sm:max-w-lg text-sm'>
				<p>{paragraphContent}</p>
			</div>
			{content}
			<div className='flex bg-white p-4 pt-14 rounded-b-5'>
				<button
					type='submit'
					className={`h-16 w-full py-2 px-4 border border-transparent rounded-5 shadow-sm text-sm font-medium text-white bg-black bg-opacity-${buttonOpacity} hover:bg-lumerin-aqua focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lumerin-aqua`}
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
