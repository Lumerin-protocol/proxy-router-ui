import React from 'react';
import { ContentState, InputValuesCreateForm } from '../../../types';
import { Spinner } from '../Spinner';

interface ConfirmContentProps {
	data: InputValuesCreateForm;
	contentState: ContentState;
}

export const ConfirmContent: React.FC<ConfirmContentProps> = ({ data: { walletAddress, contractTime, speed, listPrice }, contentState }) => {
	return contentState === ContentState.Pending ? (
		<Spinner />
	) : (
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

	// return (
	// 	<div className='flex flex-col bg-white p-4 p-4 font-Inter text-sm' style={{ minWidth: '30rem' }}>
	// 		<div className='confirm-div gap-6'>
	// 			<p>Wallet Address</p>
	// 			<p>{walletAddress}</p>
	// 		</div>
	// 		<div className='confirm-div'>
	// 			<p>Contract Time</p>
	// 			<p>{contractTime} hours</p>
	// 		</div>
	// 		<div className='confirm-div'>
	// 			<p>Speed</p>
	// 			<p>{speed} TH/S</p>
	// 		</div>
	// 		<div className='confirm-div'>
	// 			<p>List Price</p>
	// 			<p>{listPrice} LMR</p>
	// 		</div>
	// 	</div>
	// );
};

ConfirmContent.displayName = 'ConfirmContent';
ConfirmContent.whyDidYouRender = false;
