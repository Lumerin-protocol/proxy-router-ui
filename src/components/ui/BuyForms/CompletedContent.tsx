import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { Spinner } from '../Spinner';
const { colors } = require('styles/styles.config.js');

interface CompletedContentProps {
	isTransactionPending: boolean;
}
export const CompletedContent: React.FC<CompletedContentProps> = ({ isTransactionPending }) => {
	return (
		<div className='flex flex-col items-center bg-white font-Inter'>
			{isTransactionPending ? null : (
				<div className='flex flex-col items-center'>
					<FontAwesomeIcon className='my-8' icon={faCheckCircle} size='5x' color={colors['lumerin-aqua']} />
					<p className='w-4/6 text-center text-xl mb-8'>Thank you for purchasing Hashpower from Lumerin!</p>
					<p className='w-5/6 text-center text-sm'>
						The hashpower you purchased will be routed shortly. You can find details on your order below.
					</p>
				</div>
			)}
			{isTransactionPending ? (
				<div className='flex flex-col items-center mb-4'>
					<p className='w-4/6 text-center text-xl mb-8'>Thank you for purchasing Hashpower from Lumerin!</p>
					<p className='w-5/6 text-center text-sm'>Your Transaction is pending.</p>
				</div>
			) : null}
			{isTransactionPending ? <Spinner /> : null}
		</div>
	);
};

CompletedContent.displayName = 'CompletedContent';
CompletedContent.whyDidYouRender = false;
