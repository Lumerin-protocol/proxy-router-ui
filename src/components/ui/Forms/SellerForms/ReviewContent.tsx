import React from 'react';
import { DeepMap, FieldError, UseFormRegister } from 'react-hook-form';
import { InputValuesCreateForm } from '../../../../types';
import { divideByDigits } from '../../../../web3/helpers';
import { InputWrapper } from '../Forms.styled';

interface ReviewContentProps {
	register: UseFormRegister<InputValuesCreateForm>;
	errors: DeepMap<InputValuesCreateForm, FieldError | undefined>; // undefined bc error for specific input might not exist
	data?: InputValuesCreateForm;
	isCreate?: boolean;
}

export const ReviewContent: React.FC<ReviewContentProps> = ({
	register,
	errors,
	data,
	isCreate,
}) => {
	const listPrice = data && data.listPrice ? divideByDigits(data.listPrice) : 0;

	return (
		<React.Fragment>
			<InputWrapper>
				<label htmlFor='walletAddress' className='block text-sm font-medium text-gray-700'>
					Ethereum Address *
				</label>
				<input
					{...register('walletAddress', {
						value: data?.walletAddress ?? '',
						required: 'Wallet Address is required',
					})}
					disabled
					id='walletAddress'
					type='text'
					className={
						errors.walletAddress
							? 'bg-red-100 btn-modal placeholder-red-400 review-input'
							: 'review-no-errors review-input'
					}
				/>
			</InputWrapper>
			{!errors.walletAddress && (
				<div className='text-xs text-lumerin-helpertext-gray'>
					Funds will be paid into this account once the contract is fulfilled.
				</div>
			)}
			{errors.walletAddress?.type === 'required' && (
				<div className='text-xs text-red-500'>{errors.walletAddress.message}</div>
			)}
			<InputWrapper>
				<label htmlFor='contractTime' className='block text-sm font-medium text-gray-700'>
					Contract Time *
				</label>
				<input
					{...register('contractTime', {
						value: !isCreate && data ? data.contractTime : undefined,
						required: 'Contract Time is required',
						valueAsNumber: true,
						validate: (value) => {
							if (value || value === 0) return value > 0;
						},
					})}
					min='24'
					id='contractTime'
					type='number'
					placeholder={data?.contractTime?.toString() ?? '# of hours'}
					className={
						errors.contractTime
							? 'bg-red-100 btn-modal placeholder-red-400 review-input'
							: 'review-no-errors review-input'
					}
				/>
			</InputWrapper>
			{!errors.contractTime && (
				<div className='text-xs text-lumerin-helpertext-gray'>Contract Length (hours)</div>
			)}
			{errors.contractTime?.type === 'required' && (
				<div className='text-xs text-red-500'>{errors.contractTime.message}</div>
			)}
			{errors.contractTime?.type === 'validate' && (
				<div className='text-xs text-red-500'>Minimim time is 24 hours</div>
			)}

			<InputWrapper>
				<label htmlFor='endDate' className='block text-sm font-medium text-gray-700'>
					Speed *
				</label>
				<input
					{...register('speed', {
						value: !isCreate && data ? data.speed : undefined,
						required: 'Speed is required',
						validate: (value) => {
							if (value || value === 0) return value > 0;
						},
					})}
					min='1'
					id='speed'
					type='number'
					placeholder={data?.speed?.toString() ?? '100'}
					className={
						errors.speed
							? 'bg-red-100 btn-modal placeholder-red-400 review-input'
							: 'review-no-errors review-input'
					}
				/>
			</InputWrapper>
			{!errors.speed && <div className='text-xs text-lumerin-helpertext-gray'>TH/S</div>}
			{errors.speed?.type === 'required' && (
				<div className='text-xs text-red-500'>{errors.speed.message}</div>
			)}
			{errors.speed?.type === 'validate' && (
				<div className='text-xs text-red-500'>Speed is required</div>
			)}
			<InputWrapper>
				<label htmlFor='listPrice' className='block text-sm font-medium text-gray-700'>
					<div className='flex justify-between'>
						<p>List Price (LMR) *</p>
					</div>
				</label>
				<input
					{...register('listPrice', {
						value: !isCreate ? listPrice : undefined,
						valueAsNumber: true,
						required: 'Price is required',
						validate: (value) => {
							if (value || value === 0) return Number.isInteger(value) && value !== 0;
						},
					})}
					min='1'
					id='listPrice'
					type='number'
					placeholder='100'
					className={
						errors.listPrice
							? 'bg-red-100 btn-modal placeholder-red-400 review-input'
							: 'review-no-errors review-input'
					}
				/>
			</InputWrapper>
			{!errors.listPrice && (
				<div className='text-xs text-lumerin-helpertext-gray'>
					<p>This is the price you will deploy your contract to the marketplace.</p>
				</div>
			)}
			{errors.listPrice?.type === 'required' && (
				<div className='text-xs text-red-500'>{errors.listPrice.message}</div>
			)}
			{errors.listPrice?.type === 'validate' && (
				<div className='text-xs text-red-500'>Price must be a whole number</div>
			)}
		</React.Fragment>
	);
};
