import React from 'react';
import { DeepMap, FieldError, UseFormRegister } from 'react-hook-form';
import { InputValues } from './CreateForm';
import { classNames } from '../../../utils';

interface CreateContentProps {
	register: UseFormRegister<InputValues>;
	errors: DeepMap<InputValues, FieldError | undefined>; // undefined bc error for specific input might not exist
}

export const CreateContent: React.FC<CreateContentProps> = ({ register, errors }) => {
	return (
		<React.Fragment>
			<div className='bg-white p-4 p-4'>
				<div>
					<label htmlFor='walletAddress' className='block text-sm font-medium text-gray-700'>
						Ethereum Address *
					</label>
					<div className='mt-1'>
						<input
							{...register('walletAddress', {
								required: 'Wallet Address is required',
							})}
							id='walletAddress'
							type='text'
							placeholder='0x0c34...'
							className={classNames(
								errors.walletAddress ? 'bg-red-100 btn-modal placeholder-red-400 review-input' : 'review-no-errors review-input'
							)}
						/>
					</div>
					{errors.walletAddress?.type === 'required' && <div className='text-xs text-red-500'>{errors.walletAddress.message}</div>}
				</div>
			</div>
			<div className='flex'>
				<div className='bg-white p-4 p-4'>
					<label htmlFor='contractTime' className='block text-sm font-medium text-gray-700'>
						Contract Time *
					</label>
					<div className='mt-1'>
						<input
							{...register('contractTime', {
								required: 'Contract Time is required',
							})}
							id='contractTime'
							type='text'
							placeholder='# of hours'
							className={classNames(
								errors.contractTime ? 'bg-red-100 btn-modal placeholder-red-400 review-input' : 'review-no-errors review-input'
							)}
						/>
					</div>
					{errors.contractTime?.type === 'required' && <div className='text-xs text-red-500'>{errors.contractTime.message}</div>}
				</div>

				<div className='bg-white p-4 p-4'>
					<label htmlFor='endDate' className='block text-sm font-medium text-gray-700'>
						End Date *
					</label>
					<div className='mt-1'>
						<input
							{...register('endDate', {
								required: 'End Date is required',
							})}
							id='endDate'
							type='text'
							placeholder='12/05/2021'
							className={classNames(
								errors.endDate ? 'bg-red-100 btn-modal placeholder-red-400 review-input' : 'review-no-errors review-input'
							)}
						/>
					</div>
					{errors.endDate?.type === 'required' && <div className='text-xs text-red-500'>{errors.endDate.message}</div>}
				</div>
			</div>
			<div className='bg-white p-4 p-4'>
				<div>
					<label htmlFor='listPrice' className='block text-sm font-medium text-gray-700'>
						List Price *
					</label>
					<div className='mt-1'>
						<input
							{...register('listPrice', {
								required: 'List Price is required',
							})}
							id='listPrice'
							type='text'
							placeholder='cost per terahash'
							className={classNames(
								errors.listPrice ? 'bg-red-100 btn-modal placeholder-red-400 review-input' : 'review-no-errors review-input'
							)}
						/>
					</div>
					{errors.listPrice?.type === 'required' && <div className='text-xs text-red-500'>{errors.listPrice.message}</div>}
				</div>
			</div>
		</React.Fragment>
	);
};

CreateContent.displayName = 'CreateContent';
CreateContent.whyDidYouRender = false;
