import React from 'react';
import { DeepMap, FieldError, UseFormRegister } from 'react-hook-form';
import { classNames } from '../../../utils';
import { InputValues } from './BuyForm';

interface ReviewContentProps {
	register: UseFormRegister<InputValues>;
	errors: DeepMap<InputValues, FieldError>;
}
export const ReviewContent: React.FC<ReviewContentProps> = ({ register, errors }) => {
	return (
		<React.Fragment>
			<div className='bg-white p-4 p-4'>
				<div>
					<label htmlFor='email' className='block text-sm font-medium text-gray-700'>
						Pool Address *
					</label>
					<div className='mt-1'>
						<input
							{...register('poolAddress', {
								required: 'Pool Address is required',
							})}
							id='poolAddress'
							type='text'
							placeholder=' stratum+tcp://IPorHostname'
							className={classNames(
								errors.poolAddress
									? 'appearance-none block w-full px-3 py-2 bg-red-100 border border-transparent rounded-5 shadow-sm placeholder-red-400 placeholder-opacity-75 focus:outline-none focus:ring-lumerin-aqua focus:border-indigo-500 sm:text-sm'
									: 'appearance-none block w-full px-3 py-2 bg-lumerin-input-gray border border-transparent rounded-5 shadow-sm placeholder-lumerin-placeholder-gray placeholder-opacity-75 focus:outline-none focus:ring-lumerin-aqua focus:border-indigo-500 sm:text-sm'
							)}
						/>
					</div>
					{errors.poolAddress?.type === 'required' && <div className='text-xs text-red-500'>{errors.poolAddress.message}</div>}
				</div>
			</div>

			<div className='bg-white p-4 p-4'>
				<label htmlFor='email' className='block text-sm font-medium text-gray-700'>
					Username
				</label>
				<div className='mt-1'>
					<input
						{...register('username')}
						id='username'
						type='text'
						placeholder='account.worker'
						className='appearance-none block w-full px-3 py-2 bg-lumerin-input-gray border border-transparent rounded-5 shadow-sm placeholder-lumerin-placeholder-gray placeholder-opacity-75 focus:outline-none focus:ring-lumerin-aqua focus:border-indigo-500 sm:text-sm'
					/>
				</div>
			</div>

			<div className='bg-white p-4 p-4'>
				<label htmlFor='password' className='block text-sm font-medium text-gray-700'>
					Password
				</label>
				<div className='mt-1'>
					<input
						{...register('password')}
						id='password'
						type='password'
						placeholder='password'
						className='appearance-none block w-full px-3 py-2 bg-lumerin-input-gray border border-transparent rounded-5 shadow-sm placeholder-lumerin-placeholder-gray placeholder-opacity-75 focus:outline-none focus:ring-lumerin-aqua focus:border-indigo-500 sm:text-sm'
					/>
				</div>
			</div>
		</React.Fragment>
	);
};

ReviewContent.displayName = 'ReviewContent';
ReviewContent.whyDidYouRender = false;
