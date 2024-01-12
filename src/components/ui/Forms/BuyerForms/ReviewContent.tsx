import { InputLabel, MenuItem, Select } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { DeepMap, FieldError, UseFormRegister, UseFormSetValue } from 'react-hook-form';
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

interface PoolData {
	name: string;
	address: string;
	port: string;
}

interface ReviewContentProps {
	register: UseFormRegister<InputValuesBuyForm>;
	errors: DeepMap<InputValuesBuyForm, FieldError | undefined>; // undefined bc error for specific input might not exist
	setValue?: UseFormSetValue<InputValuesBuyForm>;
	buyerString?: string;
	isEdit?: boolean;
}
export const ReviewContent: React.FC<ReviewContentProps> = ({
	register,
	errors,
	setValue,
	buyerString,
	isEdit,
	setFormData,
	inputData,
}) => {
	const { withValidator, poolAddress, portNumber, username, password, speed, price } = inputData;
	const [alertOpen, setAlertOpen] = useState<boolean>(false);
	const [preferredPool, setPreferredPool] = useState<PoolData>({ name: '', address: '', port: '' });

	const preferredPools = [
		{ name: 'Titan', address: 'stratum+tcp://mining.pool.titan.io', port: '4242' },
		{ name: 'Lincoin', address: 'stratum+tcp://ca.lincoin.com', port: '3333' },
		{ name: 'Luxor', address: 'stratum+tcp://btc.global.luxor.tech', port: '700' },
		{ name: 'Braiins', address: 'stratum+tcp://stratum.braiins.com', port: '3333' },
	];

	// hiding references to validator service at the moment: my 5/9/22
	/* const checkboxLegend = 'Validator';
	const checkboxLabel = 'Titan Validator Service';
	const checkboxDescription = 'Use the Titan Validator to verify your delivered hashrate for a small fee.'; */

	const handlePoolChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const selectedPool = preferredPools.find((item) => item.name === event.target.value);
		setPreferredPool({ ...preferredPool, ...selectedPool });
	};

	useEffect(() => {
		setValue?.('poolAddress', preferredPool.address);
		setValue?.('portNumber', preferredPool.port);
	}, [preferredPool]);

	return (
		<React.Fragment>
			<Alert
				message={AlertMessage.RemovePort}
				isOpen={alertOpen}
				onClose={() => setAlertOpen(false)}
			/>
			<InputWrapper>
				<InputLabel sx={{ color: 'black', fontFamily: 'inherit' }} id='preferred-pools-label'>
					Preferred Pools
				</InputLabel>
				<Select
					labelId='preferred-pools-label'
					id='preferred-pools'
					displayEmpty
					value={preferredPool.name}
					label='Preferred Pools'
					onChange={(event: any) => handlePoolChange(event)}
				>
					<MenuItem value=''>Select a preferred pool</MenuItem>
					{preferredPools.map((item) => (
						<MenuItem value={item.name} key={item.name}>
							{item.name}
						</MenuItem>
					))}
				</Select>
			</InputWrapper>
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
					//defaultValue={
					// 	isEdit && buyerString
					// 		? `${getSchemeName(buyerString)}://${getHostName(buyerString)}`
					// 		: ''
					// }
					onChange={(e) =>
						setFormData({
							...inputData,
							poolAddress: e.target.value,
						})
					}
					value={poolAddress}
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
					//defaultValue={isEdit && buyerString ? getPortString(buyerString) : ''}
					value={portNumber}
					onChange={(e) =>
						setFormData({
							...inputData,
							portNumber: e.target.value,
						})
					}
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
					//defaultValue={isEdit && buyerString ? getWorkerName(buyerString) : ''}
					value={username}
					onChange={(e) =>
						setFormData({
							...inputData,
							username: e.target.value,
						})
					}
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
					// defaultValue={isEdit && buyerString ? getPassword(buyerString) : ''}
					value={password}
					onChange={(e) =>
						setFormData({
							...inputData,
							password: e.target.value,
						})
					}
				/>
			</InputWrapper>
			{/* {!isEdit && <Checkbox legend={checkboxLegend} label={checkboxLabel} description={checkboxDescription} register={register} />} */}
		</React.Fragment>
	);
};

ReviewContent.displayName = 'ReviewContent';
ReviewContent.whyDidYouRender = false;
