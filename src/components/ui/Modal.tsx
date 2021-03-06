import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';

interface ModalProps {
	open: boolean;
	setOpen: React.Dispatch<React.SetStateAction<boolean>>;
	content: JSX.Element;
}

export const Modal: React.FC<ModalProps> = ({ open, setOpen, content }) => {
	return (
		<Transition.Root show={open} as={Fragment}>
			<Dialog as='div' auto-reopen='true' className='fixed z-10 inset-0 overflow-y-auto' onClose={setOpen}>
				<div className='flex items-end justify-center items-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0'>
					<Transition.Child
						as={Fragment}
						enter='enter-300'
						enterFrom='entertfrom-leaveto-opacity'
						enterTo='enterto-enterleave-opacity'
						leave='ease-in duration-200'
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
						enterFrom='entertfrom-leaveto-opacity translate-y-4 sm:translate-y-0 sm:scale-95'
						enterTo='enterto-enterleave-opacity translate-y-0 sm:scale-100'
						leave='ease-in duration-200'
						leaveFrom='enterto-enterleave-opacity translate-y-0 sm:scale-100'
						leaveTo='entertfrom-leaveto-opacity translate-y-4 sm:translate-y-0 sm:scale-95'
					>
						<div className='inline-block align-bottom text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle'>
							{content}
						</div>
					</Transition.Child>
				</div>
			</Dialog>
		</Transition.Root>
	);
};

Modal.displayName = 'Modal';
Modal.whyDidYouRender = false;
