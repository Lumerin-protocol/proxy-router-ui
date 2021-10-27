import React from 'react';
import { DateTime } from 'luxon';
import { InputValuesCreateForm } from '../../../types';

interface ConfirmContentProps {
	data: InputValuesCreateForm;
}

export const ConfirmContent: React.FC<ConfirmContentProps> = ({ data: { walletAddress, contractTime, endDate, listPrice } }) => {
	return (
		<div className='flex flex-col bg-white p-4 p-4 font-Inter text-sm' style={{ minWidth: '30rem' }}>
			<div className='confirm-div'>
				<p>Wallet Address</p>
				<p>{walletAddress}</p>
			</div>
			<div className='confirm-div'>
				<p>Contract Time</p>
				<p>{contractTime}</p>
			</div>
			<div className='confirm-div'>
				<p>End Date</p>
				<p>{DateTime.fromJSDate(endDate as Date).toFormat('MM/dd/yyyy')}</p>
			</div>
			<div className='confirm-div'>
				<p>List Price</p>
				<p>{listPrice}</p>
			</div>
		</div>
	);
};

ConfirmContent.displayName = 'ConfirmContent';
ConfirmContent.whyDidYouRender = false;
