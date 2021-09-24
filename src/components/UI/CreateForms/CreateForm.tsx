import { useState } from 'react';
import { useForm } from 'react-hook-form';

// Making fields optional bc a user might not have filled out the input fields
// when useForm() returns the error object that's typed against InputValues
export interface InputValues {
	sellerAddress?: string;
	time?: number;
	endDate?: string;
	listPrice: number;
}

enum ContentState {
	Create = 'create',
	Draft = 'draft',
	Complete = 'completed',
}

export const CreateForm: React.FC = () => {
	const [buttonOpacity, setButtonOpacity] = useState<string>('25');
	const [contentState, setContentState] = useState<string>(ContentState.Create);

	// Input validation setup
	const {
		register,
		handleSubmit,
		formState: { errors, isValid },
	} = useForm<InputValues>({ mode: 'onBlur' });

	const createContract: (data: InputValues) => void = (data) => {
		throw new Error('Function not implemented.');
	};

	// Content setup
	// Defaults to create state
	// Initialize variables since html elements need values on first render
	let buttonContent = 'Save As Draft';
	let content = <div></div>;
	const createContent: () => void = () => {
		switch (contentState) {
			case ContentState.Create:
				// content = <ConfirmContent data={formData} />;
				break;
			case ContentState.Complete:
				// content = <CompletedContent />;
				break;
			default:
			// content = <ReviewContent register={register} errors={errors} />;
		}
	};
	createContent();

	const bgColor = contentState === ContentState.Complete ? 'bg-lumerin-aqua' : 'bg-black';

	return (
		<div className={`flex flex-col justify-center w-full font-Inter font-medium`} style={{ maxWidth: '32rem' }}>
			<div className='flex justify-between bg-lumerin-aqua p-4 border-transparent rounded-t-5'>
				<div className='text-white'>
					<p className='text-lg'>Create New Contract</p>
					<p className='text-sm'>Sell your hashpower to the Lumerin Marketplace</p>
				</div>
			</div>
			<div className='flex flex-col bg-white p-4 pt-14 rounded-b-5'>
				<button
					type='submit'
					className={`h-16 w-full py-2 px-4 btn-buy-modal text-sm font-medium text-white ${bgColor} hover:bg-lumerin-aqua focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lumerin-aqua`}
					style={{ opacity: buttonOpacity === '25' ? '.25' : '1' }}
					onClick={handleSubmit((data) => createContract(data))}
				>
					{buttonContent}
				</button>
				<button
					type='submit'
					className={`h-16 w-full py-2 px-4 btn-buy-modal text-sm font-medium text-white ${bgColor} hover:bg-lumerin-aqua focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lumerin-aqua`}
					style={{ opacity: buttonOpacity === '25' ? '.25' : '1' }}
					onClick={handleSubmit((data) => createContract(data))}
				>
					Create New Contract
				</button>
			</div>
		</div>
	);
};

CreateForm.displayName = 'CreateForm';
CreateForm.whyDidYouRender = false;
