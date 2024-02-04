import React from 'react';
import Web3 from 'web3';
import { FormData } from '../../../../types';
import { divideByDigits } from '../../../../web3/helpers';
import { ReviewItems } from '../Forms.styled';

interface ConfirmContentProps {
	web3: Web3 | undefined;
	data: FormData;
}

export const ConfirmContent: React.FC<ConfirmContentProps> = ({
	web3,
	data: { poolAddress, portNumber, username, speed, price, length },
}) => {
	return (
		<ReviewItems>
			<div>
				<h3>Pool Address</h3>
				<p>{poolAddress}</p>
			</div>
			<div>
				<h3>Port Number</h3>
				<p>{portNumber}</p>
			</div>
			<div>
				<h3>Username</h3>
				<p>{username}</p>
			</div>
			{/* <div>
				<h3>Speed (TH/S)</h3>
				<p>{String(Number(speed) / 10 ** 12)}</p>
			</div>
			<div>
				<h3>Duration (HOURS)</h3>
				<p>{String(parseInt(length as string) / 3600)}</p>
			</div> */}
			{/* <div className='total-cost'>
				<h3>Total Cost</h3>
				<p className='price'>{price ? divideByDigits(parseInt(price)) : price} LMR</p>
			</div> */}
			{/* <div className='confirm-div'>
				<p>Use Titan Validator Service</p>
				<p>{withValidator ? 'Yes' : 'No'}</p>
			</div> */}
		</ReviewItems>
	);
};

ConfirmContent.displayName = 'ConfirmContent';
ConfirmContent.whyDidYouRender = false;
