import React from 'react';
import { DeepMap, FieldError, UseFormRegister } from 'react-hook-form';
import { classNames } from '../../../utils';
import { InputValues } from './BuyForm';

interface ReviewContentProps {
	register: UseFormRegister<InputValues>;
	errors: DeepMap<InputValues, FieldError>;
}
export const ReviewContent: React.FC<ReviewContentProps> = ({ register, errors }) => {
	const IP_REGEX = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
	const PORT_REGEX = /^([0-9]{1,4}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])$/;

	return (
		<React.Fragment>
			<div className='bg-white p-4 p-4'>
				<div className='flex justify-between'>
					<div className='w-3/5'>
						<label htmlFor='email' className='block text-sm font-medium text-gray-700'>
							IP Address *
						</label>
						<div className='mt-1'>
							<input
								{...register('ipAddress', {
									required: 'IP address is required',
									pattern: { value: IP_REGEX, message: 'Invalid IP Address' },
								})}
								id='ipAddress'
								type='text'
								placeholder='127.0.0.1'
								className={classNames(
									errors.ipAddress
										? 'appearance-none block w-full px-3 py-2 bg-red-100 border border-transparent rounded-5 shadow-sm placeholder-red-400 placeholder-opacity-75 focus:outline-none focus:ring-lumerin-aqua focus:border-indigo-500 sm:text-sm'
										: 'appearance-none block w-full px-3 py-2 bg-lumerin-input-gray border border-transparent rounded-5 shadow-sm placeholder-lumerin-placeholder-gray placeholder-opacity-75 focus:outline-none focus:ring-lumerin-aqua focus:border-indigo-500 sm:text-sm'
								)}
							/>
						</div>
						{errors.ipAddress?.type === 'required' && <div className='text-xs text-red-500'>{errors.ipAddress.message}</div>}
						{errors.ipAddress?.type === 'pattern' && <div className='text-xs text-red-500'>{errors.ipAddress.message}</div>}
					</div>
					<div className='w-36'>
						<label htmlFor='email' className='block text-sm font-medium text-gray-700'>
							Port Number *
						</label>
						<div className='mt-1'>
							<input
								{...register('portNumber', {
									required: 'Port number is required',
									pattern: {
										value: PORT_REGEX,
										message: 'Invalid Port Number',
									},
								})}
								id='portNumber'
								type='text'
								placeholder='7777'
								className={classNames(
									errors.portNumber
										? 'appearance-none block w-full px-3 py-2 bg-red-100 border border-transparent rounded-5 shadow-sm placeholder-red-400 placeholder-opacity-75 focus:outline-none focus:ring-lumerin-aqua focus:border-indigo-500 sm:text-sm'
										: 'appearance-none block w-full px-3 py-2 bg-lumerin-input-gray border border-transparent rounded-5 shadow-sm placeholder-lumerin-placeholder-gray placeholder-opacity-75 focus:outline-none focus:ring-lumerin-aqua focus:border-indigo-500 sm:text-sm'
								)}
							/>
							{errors.portNumber?.type === 'required' && <div className='text-xs text-red-500'>{errors.portNumber.message}</div>}
							{errors.portNumber?.type === 'pattern' && <div className='text-xs text-red-500'>{errors.portNumber.message}</div>}
						</div>
					</div>
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
