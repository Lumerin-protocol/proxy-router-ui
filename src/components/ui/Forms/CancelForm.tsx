import { Fragment, useState } from 'react';
import { ContentState, UpdateFormProps } from '../../../types';

export const CancelForm: React.FC<UpdateFormProps> = (setOpen) => {
	const [contentState, setContentState] = useState<string>(ContentState.Review);

	const submitHandler: () => void = () => {
		if (contentState === ContentState.Review) setContentState(ContentState.Confirm);
		if (contentState === ContentState.Confirm) {
			// TODO: call cancelContractAsync()
		}
	};

	return (
		<div className={`flex flex-col justify-center w-full font-Inter font-medium`} style={{ minWidth: '26rem', maxWidth: '32rem' }}>
			{contentState === ContentState.Review ? (
				<Fragment>
					<div className='flex justify-between bg-white text-black modal-input-spacing pb-4 border-transparent rounded-t-5'>
						<div>
							<p className='text-3xl text-red-500'>Cancel Contract</p>
						</div>
					</div>
					<div className='bg-white modal-input-spacing'>
						You are about to cancel your contract, and the purchased hashrate will no longer be delivered.
					</div>
					<div className='flex gap-6 bg-white modal-input-spacing pb-8 rounded-b-5'>
						<button
							type='submit'
							className={`h-16 w-full py-2 px-4 btn-modal border-red-500 bg-white text-sm font-medium text-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lumerin-aqua`}
							onClick={submitHandler}
						>
							Cancel Contract
						</button>
					</div>
				</Fragment>
			) : null}
			{contentState === ContentState.Confirm ? (
				<Fragment>
					<div className='flex flex-col text-red-500'>
						<p className='bg-white modal-input-spacing border-transparent rounded-t-5'>Make sure you want to cancel the contract.</p>
						<p className='bg-white modal-input-spacing border-transparent pt-0'>The cancellation is permanent.</p>
					</div>
					<div className='flex gap-6 bg-white modal-input-spacing pb-8 rounded-b-5'>
						<button
							type='submit'
							className={`h-16 w-full py-2 px-4 btn-modal border-red-500 bg-white text-sm font-medium text-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lumerin-aqua`}
							onClick={submitHandler}
						>
							Confirm Cancel Contract
						</button>
					</div>
				</Fragment>
			) : null}
		</div>
	);
};

CancelForm.displayName = 'CancelForm';
CancelForm.whyDidYouRender = false;
