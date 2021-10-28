import React from 'react';
import { InputValuesCreateForm } from '../../../types';

interface ConfirmContentProps {
	data: InputValuesCreateForm;
}

export const ConfirmContent: React.FC<ConfirmContentProps> = ({ data: { walletAddress, contractTime, speed, listPrice } }) => {
	return (
		<div className='flex flex-col bg-white p-4 p-4 font-Inter text-sm' style={{ minWidth: '30rem' }}>
			<div className='confirm-div gap-6'>
				<p>Wallet Address</p>
				<p>{walletAddress}</p>
			</div>
			<div className='confirm-div'>
				<p>Contract Time</p>
				<p>{contractTime} hours</p>
			</div>
			<div className='confirm-div'>
				<p>Speed</p>
				<p>{speed} TH/S</p>
			</div>
			<div className='confirm-div'>
				<p>List Price</p>
				<p>{listPrice} LMR</p>
			</div>
		</div>
	);
};

ConfirmContent.displayName = 'ConfirmContent';
ConfirmContent.whyDidYouRender = false;
