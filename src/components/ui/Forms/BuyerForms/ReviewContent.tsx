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
	getValidatorURL,
	getTitanLightningPoolUrl,
	isValidLightningUsername,
} from '../../../../utils';
import { Alert } from '../../Alert';
import { InputWrapper } from '../Forms.styled';
import { Checkbox } from '../../Checkbox';

interface PoolData {
	name: string;
	address: string;
	port: string;
}

interface ReviewContentProps {
	register?: UseFormRegister<InputValuesBuyForm> | any;
	errors?: DeepMap<InputValuesBuyForm, FieldError | undefined> | any; // undefined bc error for specific input might not exist
	setValue?: UseFormSetValue<InputValuesBuyForm>;
	buyerString?: string;
	isEdit?: boolean;
	setFormData?: any;
	inputData?: any;
	onUseLightningPayoutsFlow: (value: boolean) => void;
	clearErrors: () => void;
}

let preferredPool: PoolData, setPreferredPool: React.Dispatch<React.SetStateAction<PoolData>>;

export const ReviewContent: React.FC<ReviewContentProps> = ({
	register,
	errors,
	setValue,
	buyerString,
	isEdit,
	setFormData,
	inputData,
	onUseLightningPayoutsFlow,
	clearErrors,
}) => {
	const { poolAddress, username } = inputData;
	const [alertOpen, setAlertOpen] = useState<boolean>(false);
	const [useLightningPayouts, setUseLightningPayouts] = useState<boolean>(false);
	[preferredPool, setPreferredPool] = useState<PoolData>({ name: '', address: '', port: '' });
	const lightningUrl = getTitanLightningPoolUrl();

	const preferredPools = [
		{ name: 'Titan', address: 'mining.pool.titan.io:4242', port: '4242' },
		{ name: 'Luxor', address: 'btc.global.luxor.tech:700', port: '700' },
		{ name: 'Braiins', address: 'stratum.braiins.com:3333', port: '3333' },
	];

	// hiding references to validator service at the moment: my 5/9/22
	const checkboxLegend = 'Lightning payouts';
	const checkboxLabel = 'Use Titan Pool for Lightning Payouts';
	const checkboxDescription = '';

	const handlePoolChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const selectedPool = preferredPools.find((item) => item.name === event.target.value);
		setPreferredPool({ ...preferredPool, ...selectedPool });
	};

	useEffect(() => {
		setFormData({
			...inputData,
			poolAddress: preferredPool.address,
		});
		setValue?.('poolAddress', preferredPool.address);
	}, [preferredPool]);

	return (
		<React.Fragment>
			<Alert
				message={AlertMessage.RemovePort}
				isOpen={alertOpen}
				onClose={() => setAlertOpen(false)}
			/>
			<InputWrapper>
				<label htmlFor='validatorAddress'>Validator Address</label>
				<input
					type='text'
					{...register('validatorAddress', {})}
					disabled={true}
					placeholder='stratum+tcp://IPADDRESS'
					className={
						errors?.poolAddress
							? 'bg-red-100 btn-modal placeholder-red-400 review-input'
							: 'review-no-errors review-input'
					}
					value={getValidatorURL()}
				/>
			</InputWrapper>
			<Checkbox
				legend={checkboxLegend}
				label={checkboxLabel}
				description={checkboxDescription}
				onChange={(value) => {
					onUseLightningPayoutsFlow(value);
					setUseLightningPayouts(value);
					if (!value) {
						setPreferredPool({ name: '', address: '', port: '' });
					}
					setFormData({
						...inputData,
						poolAddress: value ? lightningUrl : undefined,
						username: '',
					});
					setValue?.('poolAddress', value ? lightningUrl : undefined);
					setValue?.('username', undefined);
					clearErrors();
				}}
			/>
			{!useLightningPayouts && (
				<InputWrapper style={{ display: isEdit ? 'none' : undefined }}>
					<InputLabel sx={{ color: 'black', fontFamily: 'inherit' }} id='preferred-pools-label'>
						Predefined Pools
					</InputLabel>
					<Select
						labelId='preferred-pools-label'
						id='preferred-pools'
						displayEmpty
						value={preferredPool.name}
						label='Predefined Pools'
						onChange={(event: any) => handlePoolChange(event)}
					>
						<MenuItem value=''>Select a predefined pool</MenuItem>
						{preferredPools.map((item) => (
							<MenuItem value={item.name} key={item.name}>
								{item.name}
							</MenuItem>
						))}
					</Select>
				</InputWrapper>
			)}
			{!useLightningPayouts && (
				<InputWrapper>
					<label htmlFor='poolAddress'>Pool Address *</label>
					<input
						{...register('poolAddress', {
							required: 'Pool Address is required',
							validate: (poolAddress: string) =>
								isValidPoolAddress(poolAddress) || 'Invalid pool address.',
						})}
						id='poolAddress'
						type='text'
						disabled={useLightningPayouts}
						placeholder='POOL_IP_ADDRESS:PORT'
						className={
							errors?.poolAddress
								? 'bg-red-100 btn-modal placeholder-red-400 review-input'
								: 'review-no-errors review-input'
						}
						defaultValue={
							isEdit && buyerString
								? `${getSchemeName(buyerString)}://${getHostName(buyerString)}`
								: ''
						}
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
			)}
			<InputWrapper>
				<label htmlFor='username'>Username *</label>
				<input
					{...register('username', {
						required: 'Username is required',
						validate: (username: string) => {
							if (useLightningPayouts) {
								return isValidLightningUsername(username) || 'Invalid email.';
							}

							return (
								isValidUsername(username) ||
								'Invalid username. Only letters a-z, numbers and .@- allowed'
							);
						},
					})}
					id='username'
					type='text'
					placeholder={useLightningPayouts ? 'bob@getalby.com' : 'account.worker'}
					className={
						errors?.username
							? 'bg-red-100 btn-modal placeholder-red-400 review-input'
							: 'review-no-errors review-input'
					}
					defaultValue={isEdit && buyerString ? getWorkerName(buyerString) : ''}
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
		</React.Fragment>
	);
};

ReviewContent.displayName = 'ReviewContent';
ReviewContent.whyDidYouRender = false;
