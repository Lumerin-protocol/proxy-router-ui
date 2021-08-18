import { Dialog, Transition } from '@headlessui/react';
import { XCircleIcon } from '@heroicons/react/solid';
import { Fragment } from 'react';

interface AlertProps {
	message: string;
	open: boolean;
	setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const Alert: React.FC<AlertProps> = ({ message, open, setOpen }) => {
	return (
		<Transition.Root show={open} as={Fragment}>
			<Dialog as='div' auto-reopen='true' className='fixed z-10 inset-0 overflow-y-auto' onClose={setOpen}>
				<div className='flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0'>
					<Transition.Child
						as={Fragment}
						enter='ease-out duration-300'
						enterFrom='opacity-0'
						enterTo='opacity-100'
						leave='ease-in duration-200'
						leaveFrom='opacity-100'
						leaveTo='opacity-0'
					>
						<Dialog.Overlay className='fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity' />
					</Transition.Child>

					{/* This element is to trick the browser into centering the modal contents. */}
					<span className='hidden sm:inline-block sm:align-middle sm:h-screen' aria-hidden='true'>
						&#8203;
					</span>
					<Transition.Child
						as={Fragment}
						enter='ease-out duration-300'
						enterFrom='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
						enterTo='opacity-100 translate-y-0 sm:scale-100'
						leave='ease-in duration-200'
						leaveFrom='opacity-100 translate-y-0 sm:scale-100'
						leaveTo='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
					>
						<div className='inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full sm:p-6'>
							<div className='rounded-md bg-red-50 p-4'>
								<div className='flex'>
									<div className='flex-shrink-0'>
										<XCircleIcon className='h-5 w-5 text-red-400' aria-hidden='true' onClick={() => setOpen(false)} />
									</div>
									<div className='ml-3'>
										<h3 className='text-sm font-medium text-red-800'>{message}</h3>
									</div>
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
(Alert as any).whyDidYouRender = false;
