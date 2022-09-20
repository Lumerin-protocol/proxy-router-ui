import { Fragment, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';

interface ConnectWalletModalProps {
	open: boolean;
	setOpen: React.Dispatch<React.SetStateAction<boolean>>;
	actionButtons: JSX.Element;
}

export const ConnectWalletModal: React.FC<ConnectWalletModalProps> = ({
	open,
	setOpen,
	actionButtons,
}) => {
	let closeButtonRef = useRef(null);

	return (
		<Transition.Root show={open} as={Fragment}>
			<Dialog
				as='div'
				auto-reopen='true'
				className='fixed z-10 inset-0 overflow-y-auto'
				onClose={() => setOpen(false)}
				initialFocus={closeButtonRef}
			>
				<div className='flex justify-center items-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0'>
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
						<div className='inline-block py-10 px-4 align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full'>
							<h2 className='text-center text-md font-semibold'>Connect Wallet</h2>
							{actionButtons}
						</div>
					</Transition.Child>
					<button className='opacity-0' ref={closeButtonRef}>
						Close
					</button>
				</div>
			</Dialog>
		</Transition.Root>
	);
};

ConnectWalletModal.displayName = 'ConnectWalletModal';
ConnectWalletModal.whyDidYouRender = false;
