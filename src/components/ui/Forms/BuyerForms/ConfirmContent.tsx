import React from 'react';
import { FormData } from '../../../../types';
import { divideByDigits } from '../../../../web3/helpers';

interface ConfirmContentProps {
	data: FormData;
}

export const ConfirmContent: React.FC<ConfirmContentProps> = ({ data: { poolAddress, portNumber, username, speed, price, withValidator, length } }) => {
	return (
		<div className='flex flex-col bg-white p-4 p-4 font-Inter text-sm'>
			<div className='confirm-div'>
				<p>Pool Address</p>
				<p>{poolAddress}</p>
			</div>
			<div className='confirm-div'>
				<p>Port Number</p>
				<p>{portNumber}</p>
			</div>
			<div className='confirm-div'>
				<p>Username</p>
				<p>{username}</p>
			</div>
			<div className='confirm-div'>
				<p>Speed (TH/S)</p>
				<p>{speed}</p>
			</div>
			<div className='confirm-div'>
				<p>Duration (HOURS)</p>
				<p>{length}</p>
			</div>
			<div className='confirm-div'>
				<p>Price (LMR)</p>
				<p>{price ? divideByDigits(parseInt(price)) : price}</p>
			</div>
			<div className='confirm-div'>
				<p>Use Titan Validator Service</p>
				<p>{withValidator ? 'Yes' : 'No'}</p>
			</div>
		</div>
	);
};

ConfirmContent.displayName = 'ConfirmContent';
ConfirmContent.whyDidYouRender = false;
