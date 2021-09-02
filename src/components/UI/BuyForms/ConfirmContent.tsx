import React from 'react';
import { FormData } from './BuyForm';

interface ConfirmContentProps {
	data: FormData;
}

export const ConfirmContent: React.FC<ConfirmContentProps> = ({ data: { poolAddress, username, password, limit, speed, price } }) => {
	return (
		<div className='flex flex-col bg-white p-4 p-4 font-Inter text-sm'>
			<div className='flex justify-between my-2'>
				<p>Pool Address</p>
				<p>{poolAddress}</p>
			</div>
			<div className='flex justify-between my-2'>
				<p>Username</p>
				<p>{username}</p>
			</div>
			<div className='flex justify-between my-2'>
				<p>Limit (TH/S)</p>
				<p>{limit}</p>
			</div>
			<div className='flex justify-between my-2'>
				<p>Speed (TH/S)</p>
				<p>{speed}</p>
			</div>
			<div className='flex justify-between my-2'>
				<p>Price (ETH)</p>
				<p>{price}</p>
			</div>
		</div>
	);
};

ConfirmContent.displayName = 'ConfirmContent';
ConfirmContent.whyDidYouRender = false;
