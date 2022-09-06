import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

interface AlertProps {
	message: string;
	open: boolean;
	setOpen: React.Dispatch<React.SetStateAction<boolean>>;
	onClick?: () => void;
}

export const Alert: React.FC<AlertProps> = ({ message, open, setOpen, onClick }) => {
	return (
		<Transition.Root show={open} as={Fragment}>
			<Dialog
				as='div'
				auto-reopen='true'
				className='fixed z-10 inset-0 overflow-y-auto'
				onClose={setOpen}
			>
				<div className='flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0'>
					<Transition.Child
						as={Fragment}
						enter='enter-300'
						enterFrom='entertfrom-leaveto-opacity'
						enterTo='enterto-enterleave-opacity'
						leave='leave-200'
						leaveFrom='enterto-enterleave-opacity'
						leaveTo='entertfrom-leaveto-opacity'
					>
						<Dialog.Overlay className='fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity' />
					</Transition.Child>

					{/* This element is to trick the browser into centering the modal contents. */}
					<span className='hidden sm:inline-block sm:align-middle sm:h-screen' aria-hidden='true'>
						&#8203;
					</span>
					<Transition.Child
						as={Fragment}
						enter='enter-300'
						enterFrom='enter-from-95'
						enterTo='enter-to-100'
						leave='leave-200'
						leaveFrom='enter-to-100'
						leaveTo='enter-from-95'
					>
						<div className='inline-block align-bottom bg-white rounded-lg px-2 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full sm:p-6'>
							<div className='rounded-md bg-white p-2'>
								<div className='flex'>
									<button
										type='button'
										className='inline-flex justify-center w-full bg-white text-base text-color-white font-medium'
										onClick={onClick ? () => onClick() : () => {}}
									>
										<div className='ml-3'>
											<h3 className='text-md font-medium text-lumerin-aqua'>{message}</h3>
										</div>
									</button>
								</div>
							</div>
						</div>
					</Transition.Child>
				</div>
			</Dialog>
		</Transition.Root>
	);
};

Alert.displayName = 'Alert';
Alert.whyDidYouRender = false;
