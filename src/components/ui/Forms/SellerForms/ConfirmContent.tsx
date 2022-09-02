import React from 'react';
import { AddressLength, InputValuesCreateForm } from '../../../../types';
import { truncateAddress } from '../../../../utils';

interface ConfirmContentProps {
	data: InputValuesCreateForm;
}

export const ConfirmContent: React.FC<ConfirmContentProps> = ({ data: { walletAddress, contractTime, speed, listPrice } }) => {
	return (
		<div className='flex flex-col bg-white p-4 p-4 font-Inter text-sm'>
			<div className='confirm-div gap-6'>
				<p>Wallet Address</p>
				<p>{truncateAddress(walletAddress as string, AddressLength.MEDIUM)}</p>
			</div>
			<div className='confirm-div'>
				<p>Contract Time</p>
				<p>
					{contractTime} {contractTime && contractTime < 12 ? 'minutes' : 'hours'}{' '}
				</p>
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
