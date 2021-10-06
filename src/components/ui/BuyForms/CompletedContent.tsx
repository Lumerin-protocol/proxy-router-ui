import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
const { colors } = require('styles/styles.config.js');

export const CompletedContent: React.FC = () => {
	return (
		<div className='flex flex-col items-center bg-white font-Inter'>
			<FontAwesomeIcon className='my-8' icon={faCheckCircle} size='5x' color={colors['lumerin-aqua']} />
			<p className='w-4/6 text-center text-xl mb-8'>Thank you for purchasing Hashpower from Lumerin!</p>
			<p className='w-5/6 text-center text-sm'>The hashpower you purchased will be routed shortly. You can find details on your order below.</p>
		</div>
	);
};

CompletedContent.displayName = 'CompletedContent';
CompletedContent.whyDidYouRender = false;
