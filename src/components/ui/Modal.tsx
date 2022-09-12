import { Fragment, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';

interface ModalProps {
	open: boolean;
	setOpen: React.Dispatch<React.SetStateAction<boolean>>;
	content: JSX.Element;
}

export const Modal: React.FC<ModalProps> = ({ open, setOpen, content }) => {
	let closeButtonRef = useRef(null);

	return (
		<Transition.Root show={open} as={Fragment}>
			<Dialog
				as='div'
				auto-reopen='true'
				className='fixed z-10 inset-0 overflow-y-auto'
				onClose={setOpen}
				initialFocus={closeButtonRef}
			>
				<div className='flex justify-center items-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0'>
					<Transition.Child
						as={Fragment}
						enter='transition-opacity ease-linear duration-300'
						enterFrom='opacity-0'
						enterTo='opacity-100'
						leave='transition-opacity ease-linear duration-300'
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
						enter='transition-opacity ease-linear duration-300'
						enterFrom='opacity-0'
						enterTo='opacity-100'
						leave='transition-opacity ease-linear duration-300'
						leaveFrom='opacity-100'
						leaveTo='opacity-0'
					>
						<div className='inline-block align-bottom text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle'>
							<button className='opacity-0' ref={closeButtonRef}>
								Close
							</button>
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
