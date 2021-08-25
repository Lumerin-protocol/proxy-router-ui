import React from 'react';
import { truncateAddress } from '../../../utils';

export const BuyForm: React.FC = () => {
	return (
		<div className='flex flex-col justify-center font-Inter font-medium'>
			<div className='flex justify-between bg-lumerin-aqua p-4 border-transparent rounded-t-30'>
				<div className='text-white'>
					<p className='text-lg'>Purchase Hashpower</p>
					<p className='text-sm'>My Order</p>
				</div>
				<div className='flex flex-col items-end text-white'>
					<p className='text-lg'>Order ID</p>
					<p className='text-sm'>{truncateAddress('123456789101112131415')}</p>
				</div>
			</div>
			<div className='bg-white p-4 sm:mx-auto sm:w-full sm:max-w-lg text-sm'>
				<p>
					Please enter a valid IP Address that is connected to your mining machine as well as the Port Number. Username and PW are optional.
				</p>
			</div>

			<div className='bg-white p-4 p-4'>
				<div className='flex justify-between'>
					<div className='w-3/5'>
						<label htmlFor='email' className='block text-sm font-medium text-gray-700'>
							IP Address *
						</label>
						<div className='mt-1'>
							<input
								id='ip'
								name='ip'
								type='text'
								placeholder='127.0.0.1'
								autoComplete='email'
								required
								className='appearance-none block w-full px-3 py-2 bg-lumerin-input-gray border border-transparent rounded-120 shadow-sm placeholder-lumerin-placeholder-gray placeholder-opacity-75 focus:outline-none focus:ring-lumerin-aqua focus:border-indigo-500 sm:text-sm'
							/>
						</div>
					</div>
					<div className='w-36'>
						<label htmlFor='email' className='block text-sm font-medium text-gray-700'>
							Port Number *
						</label>
						<div className='mt-1'>
							<input
								id='port'
								name='port'
								type='text'
								placeholder='7777'
								autoComplete='email'
								required
								className='appearance-none block w-full px-3 py-2 bg-lumerin-input-gray border border-transparent rounded-120 shadow-sm placeholder-lumerin-placeholder-gray placeholder-opacity-75 focus:outline-none focus:ring-lumerin-aqua focus:border-indigo-500 sm:text-sm'
							/>
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
						id='username'
						name='username'
						type='text'
						placeholder='account.worker'
						autoComplete='email'
						required
						className='appearance-none block w-full px-3 py-2 bg-lumerin-input-gray border border-transparent rounded-120 shadow-sm placeholder-lumerin-placeholder-gray placeholder-opacity-75 focus:outline-none focus:ring-lumerin-aqua focus:border-indigo-500 sm:text-sm'
					/>
				</div>
			</div>

			<div className='bg-white p-4 p-4'>
				<label htmlFor='password' className='block text-sm font-medium text-gray-700'>
					Password
				</label>
				<div className='mt-1'>
					<input
						id='password'
						name='password'
						type='password'
						placeholder='password'
						autoComplete='current-password'
						required
						className='appearance-none block w-full px-3 py-2 bg-lumerin-input-gray border border-transparent rounded-120 shadow-sm placeholder-lumerin-placeholder-gray placeholder-opacity-75 focus:outline-none focus:ring-lumerin-aqua focus:border-indigo-500 sm:text-sm'
					/>
				</div>
			</div>
			<div className='bg-white p-4 pt-14 rounded-b-30'>
				<div className='flex justify-center mb-4'>
					{/* TODO: change background color based on state of form */}
					<span className='h-3.5 w-3.5 inline-block rounded-50% bg-lumerin-input-gray mr-1'></span>
					<span className='h-3.5 w-3.5 inline-block rounded-50% bg-lumerin-input-gray'></span>
				</div>
				<button
					type='submit'
					className='w-full flex justify-center py-2 px-4 border border-transparent rounded-120 shadow-sm text-sm font-medium text-white bg-black bg-opacity-25 hover:bg-lumerin-aqua focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lumerin-aqua'
				>
					Review Order
				</button>
			</div>
		</div>
	);
};

BuyForm.displayName = 'BuyForm';
(BuyForm as any).whyDidYouRender = false;
