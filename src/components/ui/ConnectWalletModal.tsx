import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';

interface ConnectWalletModalProps {
	open: boolean;
	setOpen: React.Dispatch<React.SetStateAction<boolean>>;
	connectWallet: () => void;
}

// currently not in use
export const ConnectWalletModal: React.FC<ConnectWalletModalProps> = ({
	open,
	setOpen,
	connectWallet,
}) => {
	return (
		<Transition.Root show={open} as={Fragment}>
			<Dialog
				as='div'
				auto-reopen='true'
				className='fixed z-10 inset-0 overflow-y-auto'
				onClose={setOpen}
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
						<div className='inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full sm:p-6'>
							<div>
								<div className='mt-3 text-center sm:mt-5'>
									<div className='mt-2'>
										<p className='text-sm text-black'>
											By connecting a wallet, you agree to{' '}
											<span className='text-titan-aqua'>Titan’ Terms of Service</span> and
											acknowledge that you have read and understand the Lumerin protocol disclaimer.
										</p>
									</div>
								</div>
							</div>
							<div className='mt-5 sm:mt-6'>
								<button
									type='button'
									className='inline-flex justify-center w-full bg-lumerin-gray rounded-3xl border border-transparent shadow-sm px-4 py-2 mb-3 bg-indigo-600 text-base font-medium text-black hover:bg-titan-aqua hover:text-white focus:outline-none sm:text-sm'
									onClick={() => connectWallet()}
								>
									MetaMask
								</button>
							</div>
						</div>
					</Transition.Child>
				</div>
			</Dialog>
		</Transition.Root>
	);
};

ConnectWalletModal.displayName = 'ConnectWalletModal';
ConnectWalletModal.whyDidYouRender = false;
