import React, { useState } from 'react';
import { DeepMap, FieldError, UseFormRegister } from 'react-hook-form';
import { AlertMessage, InputValuesBuyForm } from '../../../../types';
import { isValidPoolAddress, isValidPortNumber, isValidUsername } from '../../../../utils';
import { Alert } from '../../Alert';
// import { Checkbox } from '../../Checkbox';

interface ReviewContentProps {
	register: UseFormRegister<InputValuesBuyForm>;
	errors: DeepMap<InputValuesBuyForm, FieldError | undefined>; // undefined bc error for specific input might not exist
	isEdit?: boolean;
}
export const ReviewContent: React.FC<ReviewContentProps> = ({ register, errors, isEdit }) => {
	const [alertOpen, setAlertOpen] = useState<boolean>(false);

	// hiding references to validator service at the moment: my 5/9/22
	/* const checkboxLegend = 'Validator';
	const checkboxLabel = 'Titan Validator Service';
	const checkboxDescription = 'Use the Titan Validator to verify your delivered hashrate for a small fee.'; */

	return (
		<React.Fragment>
			<Alert message={AlertMessage.RemovePort} open={alertOpen} setOpen={setAlertOpen} />
			<div className='bg-white modal-input-spacing'>
				<div>
					<label htmlFor='poolAddress' className='block text-sm font-medium text-gray-700'>
						Pool Address *
					</label>
					<div className='mt-1'>
						<input
							{...register('poolAddress', {
								value: '',
								required: 'Pool Address is required',
								validate: (poolAddress) =>
									isValidPoolAddress(poolAddress as string, setAlertOpen) ||
									'Invalid pool address.',
							})}
							id='poolAddress'
							type='text'
							placeholder='stratum+tcp://IPADDRESS'
							className={
								errors.poolAddress
									? 'bg-red-100 btn-modal placeholder-red-400 review-input'
									: 'review-no-errors review-input'
							}
						/>
					</div>
					{errors.poolAddress && (
						<div className='text-xs text-red-500'>{errors.poolAddress.message}</div>
					)}
				</div>
			</div>
			<div className='bg-white modal-input-spacing'>
				<div>
					<label htmlFor='portNumber' className='block text-sm font-medium text-gray-700'>
						Port Number *
					</label>
					<div className='mt-1'>
						<input
							{...register('portNumber', {
								value: '',
								required: 'Port Number is required',
								validate: (portNumber) =>
									isValidPortNumber(portNumber as string) || 'Invalid port number.',
							})}
							id='portNumber'
							type='number'
							placeholder='4242'
							className={
								errors.portNumber
									? 'bg-red-100 btn-modal placeholder-red-400 review-input'
									: 'review-no-errors review-input'
							}
						/>
					</div>
					{errors.portNumber && (
						<div className='text-xs text-red-500'>{errors.portNumber.message}</div>
					)}
				</div>
			</div>
			<div className='bg-white modal-input-spacing'>
				<label htmlFor='username' className='block text-sm font-medium text-gray-700'>
					Username *
				</label>
				<div className='mt-1'>
					<input
						{...register('username', {
							value: '',
							required: 'Username is required',
							validate: (username) => isValidUsername(username as string) || 'Invalid username.',
						})}
						id='username'
						type='text'
						placeholder='account.worker'
						className={
							errors.username
								? 'bg-red-100 btn-modal placeholder-red-400 review-input'
								: 'review-no-errors review-input'
						}
					/>
				</div>
				{errors.username?.type === 'required' && (
					<div className='text-xs text-red-500'>{errors.username.message}</div>
				)}
				{errors.username?.type === 'validate' && (
					<div className='text-xs text-red-500'>{errors.username.message}</div>
				)}
			</div>
			<div className='bg-white modal-input-spacing'>
				<label htmlFor='password' className='block text-sm font-medium text-gray-700'>
					Password
				</label>
				<div className='mt-1'>
					<input
						{...register('password', { value: '' })}
						id='password'
						type='password'
						placeholder='password'
						className='review-no-errors review-input'
					/>
				</div>
				{/* {!isEdit && <Checkbox legend={checkboxLegend} label={checkboxLabel} description={checkboxDescription} register={register} />} */}
			</div>
		</React.Fragment>
	);
};

ReviewContent.displayName = 'ReviewContent';
ReviewContent.whyDidYouRender = false;
