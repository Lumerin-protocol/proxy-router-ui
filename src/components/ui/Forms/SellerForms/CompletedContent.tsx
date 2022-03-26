import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ContentState } from '../../../../types';
import { Spinner } from '../../Spinner';
const { colors } = require('styles/styles.config.js');

const createText = {
	thankYou: 'Thank you for creating a Hashpower Contract on Lumerin!',
	view: 'The hashpower contract you created will be available shortly.',
};

const editText = {
	thankYou: 'Thank you for using the Lumerin Hashpower Marketplace!',
	view: 'Your changes will will be available shortly.',
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
					<p className='w-4/6 text-center text-xl mb-8'>{isEdit ? editText.thankYou : createText.thankYou}</p>
					<p className='w-5/6 text-center text-sm'>{isEdit ? editText.view : createText.view}</p>
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

CompletedContent.displayName = 'CreateCompletedContent';
CompletedContent.whyDidYouRender = false;
