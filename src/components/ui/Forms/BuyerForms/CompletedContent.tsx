import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { Spinner } from '../../Spinner';
import { ContentState } from '../../../../types';
const { colors } = require('styles/styles.config.js');

const buyText = {
	thankYou: 'Thank you for purchasing Hashpower from Lumerin!',
	view: 'The hashpower you purchased will be routed shortly.',
};

const editText = {
	thankYou: 'Thank you for updating your Hashpower Order.',
	view: 'Your changes will be effective shortly.',
};

interface CompletedContentProps {
	contentState: ContentState;
	isEdit?: boolean;
}
export const CompletedContent: React.FC<CompletedContentProps> = ({ contentState, isEdit }) => {
	return (
		<div className='flex flex-col items-center bg-white font-Inter'>
			{contentState === ContentState.Pending ? null : (
				<div className='flex flex-col items-center'>
					<FontAwesomeIcon className='my-8' icon={faCheckCircle} size='5x' color={colors['lumerin-aqua']} />
					<p className='w-4/6 text-center text-xl mb-8'>{isEdit ? editText.thankYou : buyText.thankYou}</p>
					<p className='w-5/6 text-center text-sm'>{isEdit ? editText.view : buyText.view}</p>
				</div>
			)}
			{contentState === ContentState.Pending ? (
				<div className='flex flex-col w-full items-center mb-4'>
					<p className='w-4/6 text-center text-xl mb-8'>Your transaction is pending.</p>
				</div>
			) : null}
			{contentState === ContentState.Pending ? <Spinner /> : null}
		</div>
	);
};

CompletedContent.displayName = 'BuyCompletedContent';
CompletedContent.whyDidYouRender = false;
