import React from 'react';
import { DeepMap, FieldError, UseFormRegister } from 'react-hook-form';
import { InputValues } from './CreateForm';
import { classNames } from '../../../utils';
import { DateTime } from 'luxon';

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
					{!errors.walletAddress && (
						<div className='text-xs text-lumerin-helpertext-gray'>
							Funds will be paid into this account once the contract if fulfilled.
						</div>
					)}
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
								valueAsNumber: true,
							})}
							id='contractTime'
							type='number'
							placeholder='# of hours'
							className={classNames(
								errors.contractTime ? 'bg-red-100 btn-modal placeholder-red-400 review-input' : 'review-no-errors review-input'
							)}
						/>
					</div>
					{!errors.contractTime && <div className='text-xs text-lumerin-helpertext-gray'>Contract Length (min 1 hour)</div>}
					{errors.contractTime?.type === 'required' && <div className='text-xs text-red-500'>{errors.contractTime.message}</div>}
				</div>

				<div className='bg-white p-4 p-4'>
					<label htmlFor='endDate' className='block text-sm font-medium text-gray-700'>
						End Date *
					</label>
					<div className='mt-1'>
						<input
							{...register('endDate', {
								valueAsDate: true,
								validate: (value) => DateTime.fromJSDate(value as Date).isValid,
							})}
							id='endDate'
							type='date'
							className={classNames(
								errors.endDate ? 'bg-red-100 btn-modal placeholder-red-400 review-input' : 'review-no-errors review-input'
							)}
						/>
					</div>
					{!errors.endDate && <div className='text-xs text-lumerin-helpertext-gray'>Contract Expiry</div>}
					{errors.endDate?.type === 'validate' && <div className='text-xs text-red-500'>End Date is required</div>}
				</div>
			</div>
			<div className='bg-white p-4 p-4'>
				<div>
					<label htmlFor='listPrice' className='block text-sm font-medium text-gray-700'>
						<div className='flex justify-between'>
							<p>List Price (LMR) *</p>
							<p>10 LMR</p>
						</div>
					</label>
					<div className='mt-1'>
						<select
							{...register('listPrice', {
								valueAsNumber: true,
								validate: (value) => value !== 0,
							})}
							id='listPrice'
							className={classNames(
								errors.listPrice ? 'bg-red-100 btn-modal placeholder-red-400 review-input' : 'review-no-errors review-input'
							)}
						>
							{/* dynamically populate options */}
							<option value={0}>Select amount in USD</option>
							<option value={100}>100 USD</option>
							<option value={100}>200 USD</option>
							<option value={200}>300 USD</option>
						</select>
					</div>
					{!errors.listPrice && (
						<div className='text-xs text-lumerin-helpertext-gray'>
							<p>This is the price you will deploy your contract to the marketplace.</p>
							<p className='italic'>The average list price is around TBA</p>
						</div>
					)}
					{errors.listPrice?.type === 'validate' && <div className='text-xs text-red-500'>List Price is required</div>}
				</div>
			</div>
		</React.Fragment>
	);
};

CreateContent.displayName = 'CreateContent';
CreateContent.whyDidYouRender = false;