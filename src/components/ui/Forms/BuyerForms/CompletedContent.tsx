import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { Spinner } from '../../Spinner';
import { ContentState } from '../../../../types';
const { colors } = require('styles/styles.config.js');

enum buyText {
	thankYou= 'Thank you for purchasing Hashpower from Lumerin!',
	view = 'The hashpower you purchased will be routed shortly. Please note connection times to mining pools may vary depending on the hardware and the amount of hashpower being transmitted.',
};

enum editText {
	thankYou =  'Thank you for updating your Hashpower Order.',
	view = 'Your changes will be effective shortly.',
};

interface CompletedContentProps {
	contentState: ContentState;
	isEdit?: boolean;
}
export const CompletedContent: React.FC<CompletedContentProps> = ({ contentState, isEdit }) => {
	return (
		<div className='bg-white flex flex-col'>
			{contentState === ContentState.Pending ?
				(<div className='flex flex-col w-full items-center mb-4'>
					<p className='w-4/6 text-center text-xl mb-8'>Your transaction is pending.</p>
					<Spinner />
				</div>
				) : (
					<div className='flex flex-col px-8 py-2'>
						<FontAwesomeIcon className='mb-8' icon={faCheckCircle} size='5x' color={colors['lumerin-aqua']} />
						<h2 className='w-6/6 text-left font-semibold text-xl mb-3'>{isEdit ? editText.thankYou : buyText.thankYou}</h2>
						<p className='w-6/6 text-left font-normal text-s'>{isEdit ? editText.view : buyText.view}</p>
					</div>
				)}
		</div>
	);
};

CompletedContent.displayName = 'BuyCompletedContent';
CompletedContent.whyDidYouRender = false;
