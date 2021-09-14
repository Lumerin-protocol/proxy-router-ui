import React from 'react';
import { ReviewContentData } from './BuyForm';

interface ConfirmContentProps {
	data: ReviewContentData;
}

export const ConfirmContent: React.FC<ConfirmContentProps> = ({ data: { poolAddress, username, limit, speed, price } }) => {
	return (
		<div className='flex flex-col bg-white p-4 p-4 font-Inter text-sm'>
			<div className='confirm-div'>
				<p>Pool Address</p>
				<p>{poolAddress}</p>
			</div>
			<div className='confirm-div'>
				<p>Username</p>
				<p>{username}</p>
			</div>
			<div className='confirm-div'>
				<p>Limit (TH/S)</p>
				<p>{limit}</p>
			</div>
			<div className='confirm-div'>
				<p>Speed (TH/S)</p>
				<p>{speed}</p>
			</div>
			<div className='confirm-div'>
				<p>Price (ETH)</p>
				<p>{price}</p>
			</div>
		</div>
	);
};

ConfirmContent.displayName = 'ConfirmContent';
ConfirmContent.whyDidYouRender = false;
