import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';

interface ConnectWalletModalProps {
	open: boolean;
	setOpen: React.Dispatch<React.SetStateAction<boolean>>;
	connectWallet: (wallName: string) => void;
}

export const ConnectWalletModal: React.FC<ConnectWalletModalProps> = ({ open, setOpen, connectWallet }) => {
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
							<div>
								<div className='mt-3 text-center sm:mt-5'>
									<div className='mt-2'>
										<p className='text-sm text-black'>
											By connecting a wallet, you agree to <span className='text-titan-aqua'>Titan’ Terms of Service</span> and
											acknowledge that you have read and understand the Lumerin protocol disclaimer.
										</p>
									</div>
								</div>
							</div>
							<div className='mt-5 sm:mt-6'>
								<button
									type='button'
									className='inline-flex justify-center w-full bg-titan-gray rounded-3xl border border-transparent shadow-sm px-4 py-2 mb-3 bg-indigo-600 text-base font-medium text-black hover:bg-titan-aqua hover:text-white focus:outline-none sm:text-sm'
									onClick={(event) => connectWallet(event.currentTarget.innerText)}
								>
									MetaMask
								</button>
								{/* <button
									type='button'
									className='inline-flex justify-center w-full bg-titan-gray rounded-3xl border border-transparent shadow-sm px-4 py-2 mb-3 bg-indigo-600 text-base font-medium text-black hover:bg-titan-aqua hover:text-white focus:outline-none sm:text-sm'
									onClick={(event) => connectWallet(event.currentTarget.innerText)}
								>
									WalletConnect
								</button> */}
								{/* <button
									type='button'
									className='inline-flex justify-center w-full bg-titan-gray rounded-3xl border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-black hover:bg-titan-aqua hover:text-white focus:outline-none sm:text-sm'
									onClick={(event) => connectWallet(event.currentTarget.innerText)}
								>
									Coinbase Wallet
								</button> */}
							</div>
						</div>
					</Transition.Child>
				</div>
			</Dialog>
		</Transition.Root>
	);
};

ConnectWalletModal.displayName = 'ConnectWalletModal';
(ConnectWalletModal as any).whyDidYouRender = false;
