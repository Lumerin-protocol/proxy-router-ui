import React from 'react';
import Web3 from 'web3';
import { FormData } from '../../../../types';
import { divideByDigits } from '../../../../web3/helpers';

interface ConfirmContentProps {
	web3: Web3 | undefined;
	data: FormData;
}

export const ConfirmContent: React.FC<ConfirmContentProps> = ({
	web3,
	data: { poolAddress, portNumber, username, speed, price, withValidator, length },
}) => {
	return (
		<div className='flex flex-col bg-white px-8 pt-6 text-sm'>
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
				<p>{String(Number(speed) / 10 ** 12)}</p>
			</div>
			<div className='confirm-div'>
				<p>Duration (HOURS)</p>
				<p>{String(parseInt(length as string) / 3600)}</p>
			</div>
			<div className='confirm-div'>
				<p>Price (LMR)</p>
				<p>{price ? divideByDigits(parseInt(price)) : price}</p>
			</div>
			{/* <div className='confirm-div'>
				<p>Use Titan Validator Service</p>
				<p>{withValidator ? 'Yes' : 'No'}</p>
			</div> */}
		</div>
	);
};

ConfirmContent.displayName = 'ConfirmContent';
ConfirmContent.whyDidYouRender = false;
