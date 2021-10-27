import { UseFormRegister } from 'react-hook-form';
import { InputValuesBuyForm } from '../../types';

interface CheckboxProps {
	label: string;
	description: string;
	register: UseFormRegister<InputValuesBuyForm>;
}

export const Checkbox: React.FC<CheckboxProps> = ({ label, description, register }) => {
	return (
		<fieldset className='space-y-5'>
			<legend className='sr-only'>Validator</legend>
			<div className='relative flex items-start'>
				<div className='flex items-center h-5'>
					<input
						{...register('withValidator')}
						id='withValidator'
						aria-describedby='withValidator-description'
						name='withValidator'
						type='checkbox'
						className='focus:ring-lumerin-aqua h-4 w-4 text-lumerin-aqua border-gray-300 rounded'
					/>
				</div>
				<div className='ml-3 text-sm'>
					<label htmlFor='withValidator' className='font-medium'>
						{label}
					</label>
					<p id='withValidator-description' className='text-gray-500'>
						{description}
					</p>
				</div>
			</div>
		</fieldset>
	);
};

Checkbox.displayName = 'Checkbox';
Checkbox.whyDidYouRender = false;
