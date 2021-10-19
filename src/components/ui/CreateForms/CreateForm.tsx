import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';
import { printError } from '../../../utils';
import { ConfirmContent } from './ConfirmContent';
import { CreateContent } from './CreateContent';

// Making fields optional bc a user might not have filled out the input fields
// when useForm() returns the error object that's typed against InputValues
export interface InputValues {
	walletAddress?: string;
	contractTime?: number;
	endDate?: Date;
	listPrice?: number;
}

// Used to set initial state for contentData to prevent undefined error
const initialFormData: InputValues = {
	walletAddress: '',
	contractTime: 0,
	endDate: new Date(),
	listPrice: 0,
};

enum ContentState {
	Create = 'CREATE',
	Confirm = 'CONFIRM',
}

interface CreateFormProps {
	userAccount: string;
	marketplaceContract: Contract | undefined;
	web3: Web3 | undefined;
	setOpen: Dispatch<SetStateAction<boolean>>;
}

export const CreateForm: React.FC<CreateFormProps> = ({ userAccount, marketplaceContract, web3, setOpen }) => {
	const [buttonOpacity, setButtonOpacity] = useState<string>('25');
	const [contentState, setContentState] = useState<string>(ContentState.Create);
	const [buttonText, setButtonText] = useState<string>('Create New Contract');
	const [formData, setFormData] = useState<InputValues>(initialFormData);

	// Input validation setup
	const {
		register,
		handleSubmit,
		formState: { errors, isValid },
	} = useForm<InputValues>({ mode: 'onBlur' });

	const createContract: (data: InputValues) => void = async (data) => {
		// Create
		if (isValid && contentState === ContentState.Create) {
			setContentState(ContentState.Confirm);
			setButtonText('Confirm New Contract');
			setFormData(data);
		}

		// Confirm
		if (isValid && contentState === ContentState.Confirm) {
			// TODO: update below logic when smart contract finished
			// Create contract
			// const receipt = await marketplaceContract?.methods.setCreateContract(data.walletAddress, data.speed, data.length, data.price).send({ from: userAccount });
			// if (receipt?.status) setContentState(ContentState.Complete);
			try {
				setOpen(false);
			} catch (error) {
				const typedError = error as Error;
				printError(typedError.message, typedError.stack as string);
				// crash app if can't communicate with webfacing contract
				throw typedError;
			}
		}
	};

	// Change opacity of Review Order button based on input validation
	useEffect(() => {
		if (isValid) {
			setButtonOpacity('100');
		} else {
			setButtonOpacity('25');
		}
	}, [isValid]);

	// Content setup
	// Defaults to create state
	// Initialize since html element needs a value on first render
	let content = <div></div>;
	const createContent: () => void = () => {
		switch (contentState) {
			case ContentState.Create:
				content = <CreateContent register={register} errors={errors} />;
				break;
			case ContentState.Confirm:
				content = <ConfirmContent data={formData} />;
				break;
			default:
				content = <CreateContent register={register} errors={errors} />;
		}
	};
	createContent();

	return (
		<div className={`flex flex-col justify-center w-full font-Inter font-medium`} style={{ maxWidth: '32rem' }}>
			<div className='flex justify-between bg-white p-4 border-transparent rounded-t-5'>
				<div className='text-black'>
					<p className='text-3xl'>Create New Contract</p>
					<p>Sell your hashpower to the Lumerin Marketplace</p>
				</div>
			</div>
			{content}
			<div className='flex gap-6 bg-white p-4 pt-14'>
				<button
					type='submit'
					className={`h-16 w-full py-2 px-4 btn-modal border-lumerin-aqua bg-white text-sm font-medium text-lumerin-aqua hover:bg-lumerin-aqua hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lumerin-aqua`}
					onClick={() => setOpen(false)}
				>
					Cancel
				</button>
				<button
					type='submit'
					className={`h-16 w-full py-2 px-4 btn-modal text-sm font-medium text-white bg-black hover:bg-lumerin-aqua focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lumerin-aqua`}
					style={{ opacity: buttonOpacity === '25' ? '.25' : '1' }}
					onClick={handleSubmit((data) => createContract(data))}
				>
					{buttonText}
				</button>
			</div>
		</div>
	);
};

CreateForm.displayName = 'CreateForm';
CreateForm.whyDidYouRender = false;
