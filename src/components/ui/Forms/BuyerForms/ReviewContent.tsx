import React, { useState } from 'react';
import { DeepMap, FieldError, UseFormRegister } from 'react-hook-form';
import { AlertMessage, InputValuesBuyForm } from '../../../../types';
import {
	getHostName,
	getWorkerName,
	getPortString,
	getSchemeName,
	getPassword,
	isValidPoolAddress,
	isValidPortNumber,
	isValidUsername,
} from '../../../../utils';
import { Alert } from '../../Alert';
import { InputWrapper } from '../Forms.styled';
// import { Checkbox } from '../../Checkbox';

interface ReviewContentProps {
	register: UseFormRegister<InputValuesBuyForm>;
	errors: DeepMap<InputValuesBuyForm, FieldError | undefined>; // undefined bc error for specific input might not exist
	buyerString?: string;
	isEdit?: boolean;
}
export const ReviewContent: React.FC<ReviewContentProps> = ({
	register,
	errors,
	buyerString,
	isEdit,
}) => {
	const [alertOpen, setAlertOpen] = useState<boolean>(false);

	// hiding references to validator service at the moment: my 5/9/22
	/* const checkboxLegend = 'Validator';
	const checkboxLabel = 'Titan Validator Service';
	const checkboxDescription = 'Use the Titan Validator to verify your delivered hashrate for a small fee.'; */

	return (
		<React.Fragment>
			<Alert
				message={AlertMessage.RemovePort}
				isOpen={alertOpen}
				onClose={() => setAlertOpen(false)}
			/>
			<InputWrapper>
				<label htmlFor='poolAddress'>Pool Address *</label>
				<input
					{...register('poolAddress', {
						required: 'Pool Address is required',
						validate: (poolAddress) =>
							isValidPoolAddress(poolAddress as string, setAlertOpen) || 'Invalid pool address.',
					})}
					id='poolAddress'
					type='text'
					placeholder='stratum+tcp://IPADDRESS'
					className={
						errors.poolAddress
							? 'bg-red-100 btn-modal placeholder-red-400 review-input'
							: 'review-no-errors review-input'
					}
					defaultValue={
						isEdit && buyerString
							? `${getSchemeName(buyerString)}://${getHostName(buyerString)}`
							: ''
					}
				/>
				{errors.poolAddress && (
					<div className='text-xs text-red-500'>{errors.poolAddress.message}</div>
				)}
			</InputWrapper>
			<InputWrapper>
				<label htmlFor='portNumber'>Port Number *</label>
				<input
					{...register('portNumber', {
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
					defaultValue={isEdit && buyerString ? getPortString(buyerString) : ''}
				/>
				{errors.portNumber && (
					<div className='text-xs text-red-500'>{errors.portNumber.message}</div>
				)}
			</InputWrapper>
			<InputWrapper>
				<label htmlFor='username'>Username *</label>
				<input
					{...register('username', {
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
					defaultValue={isEdit && buyerString ? getWorkerName(buyerString) : ''}
				/>
				{errors.username?.type === 'required' && (
					<div className='text-xs text-red-500'>{errors.username.message}</div>
				)}
				{errors.username?.type === 'validate' && (
					<div className='text-xs text-red-500'>{errors.username.message}</div>
				)}
			</InputWrapper>
			<InputWrapper>
				<label htmlFor='password'>Password</label>
				<input
					{...register('password')}
					id='password'
					type='password'
					placeholder='password'
					className='review-no-errors review-input'
					defaultValue={isEdit && buyerString ? getPassword(buyerString) : ''}
				/>
			</InputWrapper>
			{/* {!isEdit && <Checkbox legend={checkboxLegend} label={checkboxLabel} description={checkboxDescription} register={register} />} */}
		</React.Fragment>
	);
};

ReviewContent.displayName = 'ReviewContent';
ReviewContent.whyDidYouRender = false;
