import React from 'react';
import { DeepMap, FieldError, UseFormRegister } from 'react-hook-form';
import { classNames } from '../../../utils';
import { InputValues } from './BuyForm';

interface ReviewContentProps {
	register: UseFormRegister<InputValues>;
	errors: DeepMap<InputValues, FieldError | undefined>; // undefined bc error for specific input might not exist
}
export const ReviewContent: React.FC<ReviewContentProps> = ({ register, errors }) => {
	return (
		<React.Fragment>
			<div className='bg-white p-4 p-4'>
				<div>
					<label htmlFor='poolAddress' className='block text-sm font-medium text-gray-700'>
						Pool Address *
					</label>
					<div className='mt-1'>
						<input
							{...register('poolAddress', {
								required: 'Pool Address is required',
							})}
							id='poolAddress'
							type='text'
							placeholder='stratum+tcp://IPorHostname'
							className={classNames(
								errors.poolAddress ? 'bg-red-100 btn-modal placeholder-red-400 review-input' : 'review-no-errors review-input'
							)}
						/>
					</div>
					{errors.poolAddress?.type === 'required' && <div className='text-xs text-red-500'>{errors.poolAddress.message}</div>}
				</div>
			</div>

			<div className='bg-white p-4 p-4'>
				<label htmlFor='username' className='block text-sm font-medium text-gray-700'>
					Username *
				</label>
				<div className='mt-1'>
					<input
						{...register('username', {
							required: 'Username is required',
						})}
						id='username'
						type='text'
						placeholder='account.worker'
						className='review-no-errors review-input'
					/>
				</div>
				{errors.username?.type === 'required' && <div className='text-xs text-red-500'>{errors.username.message}</div>}
			</div>

			<div className='bg-white p-4 p-4'>
				<label htmlFor='password' className='block text-sm font-medium text-gray-700'>
					Password
				</label>
				<div className='mt-1'>
					<input {...register('password')} id='password' type='password' placeholder='password' className='review-no-errors review-input' />
				</div>
			</div>
		</React.Fragment>
	);
};

ReviewContent.displayName = 'ReviewContent';
ReviewContent.whyDidYouRender = false;
