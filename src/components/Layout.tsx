import { Fragment, useState } from 'react';
import { Dialog, Menu, Transition } from '@headlessui/react';
import { HomeIcon, MenuAlt2Icon, UsersIcon, XIcon } from '@heroicons/react/outline';
import { getWeb3Client } from '../web3/getWeb3Client';
import { truncateWalletAddress } from '../utils';

interface Navigation {
	name: string;
	href: string;
	icon: (props: React.ComponentProps<'svg'>) => JSX.Element;
	current: boolean;
}

interface UserNavigation {
	name: string;
	href: string;
}

const navigation: Navigation[] = [
	{ name: 'Marketplace', href: '#', icon: HomeIcon, current: true },
	{ name: 'My Orders', href: '#', icon: UsersIcon, current: false },
];
const userNavigation: UserNavigation[] = [
	{ name: 'Your Profile', href: '#' },
	{ name: 'Settings', href: '#' },
	{ name: 'Sign out', href: '#' },
];

const classNames = (...classes: string[]) => {
	return classes.filter(Boolean).join(' ');
};

export const Layout: React.FC = () => {
	const CONNECT_YOUR_WALLET = 'Connect Your Wallet';
	const DISCONNECT = 'Disconnect';
	const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
	const [walletText, setWalletText] = useState<string>(CONNECT_YOUR_WALLET);
	const [web3, setWeb3] = useState<Promise<any>>();
	const [accounts, setAccounts] = useState<any>();
	const [instance, setInstance] = useState<any>();

	const walletClickHandler: React.MouseEventHandler<HTMLButtonElement> = async (event) => {
		if (walletText === CONNECT_YOUR_WALLET) {
			const clientData = await getWeb3Client();
			if (clientData) {
				const { accounts, instance, web3 } = clientData;
				setAccounts(accounts);
				setInstance(instance);
				setWeb3(web3);
			}
			setWalletText(DISCONNECT);
		} else {
			setWalletText(CONNECT_YOUR_WALLET);
			setWeb3(undefined);
		}
	};

	const getTruncatedWalletAddress: () => string | null = () => {
		if (walletText === DISCONNECT && accounts) {
			return truncateWalletAddress(accounts[0]);
		}

		return null;
	};

	return (
		<div className='h-screen flex overflow-hidden bg-gray-100'>
			<Transition.Root show={sidebarOpen} as={Fragment}>
				<Dialog as='div' static className='fixed inset-0 flex z-40 md:hidden' open={sidebarOpen} onClose={setSidebarOpen}>
					<Transition.Child
						as={Fragment}
						enter='transition-opacity ease-linear duration-300'
						enterFrom='opacity-0'
						enterTo='opacity-100'
						leave='transition-opacity ease-linear duration-300'
						leaveFrom='opacity-100'
						leaveTo='opacity-0'
					>
						<Dialog.Overlay className='fixed inset-0 bg-gray-600 bg-opacity-75' />
					</Transition.Child>
					<Transition.Child
						as={Fragment}
						enter='transition ease-in-out duration-300 transform'
						enterFrom='-translate-x-full'
						enterTo='translate-x-0'
						leave='transition ease-in-out duration-300 transform'
						leaveFrom='translate-x-0'
						leaveTo='-translate-x-full'
					>
						<div className='relative flex-1 flex flex-col max-w-xs w-full pt-5 pb-4 bg-indigo-700'>
							<Transition.Child
								as={Fragment}
								enter='ease-in-out duration-300'
								enterFrom='opacity-0'
								enterTo='opacity-100'
								leave='ease-in-out duration-300'
								leaveFrom='opacity-100'
								leaveTo='opacity-0'
							>
								<div className='absolute top-0 right-0 -mr-12 pt-2'>
									<button
										type='button'
										className='ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white'
										onClick={() => setSidebarOpen(false)}
									>
										<span className='sr-only'>Close sidebar</span>
										<XIcon className='h-6 w-6 text-white' aria-hidden='true' />
									</button>
								</div>
							</Transition.Child>
							<div className='mt-5 flex-1 h-0 overflow-y-auto'>
								<nav className='px-2 space-y-1'>
									{navigation.map((item) => (
										<a
											key={item.name}
											href={item.href}
											className={classNames(
												item.current ? 'bg-indigo-800 text-white' : 'text-indigo-100 hover:bg-indigo-600',
												'group flex items-center px-2 py-2 text-base font-medium rounded-md'
											)}
										>
											<item.icon className='mr-4 flex-shrink-0 h-6 w-6 text-indigo-300' aria-hidden='true' />
											{item.name}
										</a>
									))}
								</nav>
							</div>
						</div>
					</Transition.Child>
					<div className='flex-shrink-0 w-14' aria-hidden='true'>
						{/* Dummy element to force sidebar to shrink to fit close icon */}
					</div>
				</Dialog>
			</Transition.Root>

			{/* Static sidebar for desktop */}
			<div className='hidden bg-indigo-700 md:flex md:flex-shrink-0'>
				<div className='flex flex-col w-64'>
					{/* Sidebar component, swap this element with another sidebar if you like */}
					<div className='flex flex-col flex-grow pt-5 pb-4 overflow-y-auto'>
						<div className='mt-5 flex-1 flex flex-col'>
							<nav className='flex-1 px-2 space-y-1'>
								{navigation.map((item) => (
									<a
										key={item.name}
										href={item.href}
										className={classNames(
											item.current ? 'bg-indigo-800 text-white' : 'text-indigo-100 hover:bg-indigo-600',
											'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
										)}
									>
										<item.icon className='mr-3 flex-shrink-0 h-6 w-6 text-indigo-300' aria-hidden='true' />
										{item.name}
									</a>
								))}
							</nav>
						</div>
					</div>
				</div>
			</div>
			<div className='flex flex-col w-0 flex-1 overflow-hidden'>
				<div className='relative z-10 flex-shrink-0 flex h-16 bg-white'>
					<button
						type='button'
						className='px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 md:hidden'
						onClick={() => setSidebarOpen(true)}
					>
						<span className='sr-only'>Open sidebar</span>
						<MenuAlt2Icon className='h-6 w-6' aria-hidden='true' />
					</button>
					<div className='flex-1 px-4 flex justify-end'>
						<button
							type='button'
							className='px-12 py-2 bg-white text-base font-medium text-indigo-600 hover:text-indigo-900'
							onClick={walletClickHandler}
						>
							<span className='border border-solid rounded-3xl border-indigo-300 py-2 px-4 mr-2'>{walletText}</span>
							{walletText === DISCONNECT ? (
								<span className='border border-solid rounded-3xl border-transparent py-2 px-4 bg-gray-200 text-black'>
									{getTruncatedWalletAddress()}
								</span>
							) : null}
						</button>
						<div className='ml-4 flex items-center md:ml-6'>
							{/* Profile dropdown */}
							<Menu as='div' className='ml-3 relative'>
								{({ open }) => (
									<>
										<div>
											<Menu.Button className='max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>
												<span className='sr-only'>Open user menu</span>
											</Menu.Button>
										</div>
										<Transition
											show={open}
											as={Fragment}
											enter='transition ease-out duration-100'
											enterFrom='transform opacity-0 scale-95'
											enterTo='transform opacity-100 scale-100'
											leave='transition ease-in duration-75'
											leaveFrom='transform opacity-100 scale-100'
											leaveTo='transform opacity-0 scale-95'
										>
											<Menu.Items
												static
												className='origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none'
											>
												{userNavigation.map((item) => (
													<Menu.Item key={item.name}>
														{({ active }) => (
															<a
																href={item.href}
																className={classNames(
																	active ? 'bg-gray-100' : '',
																	'block px-4 py-2 text-sm text-gray-700'
																)}
															>
																{item.name}
															</a>
														)}
													</Menu.Item>
												))}
											</Menu.Items>
										</Transition>
									</>
								)}
							</Menu>
						</div>
					</div>
				</div>

				<main className='flex-1 relative overflow-y-auto focus:outline-none'>
					<div className='w-6/12 lg:w-4/12 py-6 m-auto'>
						<div className='max-w-7xl px-4 sm:px-6 md:px-8'></div>
					</div>
				</main>
			</div>
		</div>
	);
};

Layout.displayName = 'Layout';
(Layout as any).whyDidYouRender = false;
