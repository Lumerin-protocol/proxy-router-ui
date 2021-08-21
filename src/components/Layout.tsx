import { Fragment, useEffect, useState } from 'react';
import { Dialog, Menu, Transition } from '@headlessui/react';
import { HomeIcon, MenuAlt2Icon, UsersIcon, XIcon } from '@heroicons/react/outline';
import { getWeb3Client } from '../web3/getWeb3Client';
import { truncateWalletAddress } from '../utils';
import { Alert } from './ui/Alert';
import { disconnectWallet } from '../web3/utils';

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
	// state and constants
	const CONNECT_VIA_METAMASK = 'Connect Via MetaMask';
	const DISCONNECT = 'Disconnect';
	const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
	const [walletText, setWalletText] = useState<string>(CONNECT_VIA_METAMASK);
	const [web3, setWeb3] = useState<Promise<any>>();
	const [accounts, setAccounts] = useState<string[]>();
	const [instance, setInstance] = useState<any>();
	const [alertOpen, setAlertOpen] = useState<boolean>(false);

	// Wallet setup
	const connectWallet = async () => {
		const clientData = await getWeb3Client(setAlertOpen);
		if (clientData) {
			const { accounts, instance, web3 } = clientData;
			setAccounts(accounts);
			setInstance(instance);
			setWeb3(web3);
			setWalletText(DISCONNECT);
		}
	};

	const walletClickHandler: React.MouseEventHandler<HTMLButtonElement> = async (event) => {
		if (walletText === CONNECT_VIA_METAMASK) {
			connectWallet();
		} else {
			disconnectWallet();
			setWalletText(CONNECT_VIA_METAMASK);
			setWeb3(undefined);
		}
	};

	const getTruncatedWalletAddress: () => string | null = () => {
		if (walletText === DISCONNECT && accounts) {
			return truncateWalletAddress(accounts[0]);
		}

		return null;
	};

	// when a user disconnects MetaMask, alertOpen will be true
	useEffect(() => {
		if (alertOpen) setWalletText(CONNECT_VIA_METAMASK);
	}, [alertOpen]);

	return (
		<div id='layout' className='h-screen flex overflow-hidden bg-gray-100'>
			<Alert message={'MetaMask is not connected'} open={alertOpen} setOpen={setAlertOpen} />
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
			<div className='hidden bg-white md:flex md:flex-shrink-0'>
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
							className={classNames(
								walletText === DISCONNECT
									? 'w-40 h-12 mt-4 border border-solid border-lumerin-aqua rounded-3xl bg-white text-sm text-lumerin-aqua font-Inter py-2 px-4 mr-2'
									: 'btn-wallet w-60 h-12 mt-4 rounded-3xl bg-lumerin-aqua text-sm font-Inter'
							)}
							onClick={walletClickHandler}
						>
							{walletText}
							{walletText === CONNECT_VIA_METAMASK ? (
								<svg
									width='19'
									height='20'
									viewBox='0 0 19 20'
									fill='none'
									xmlns='http://www.w3.org/2000/svg'
									style={{ marginLeft: '.5rem' }}
								>
									<path
										d='M17.1363 1L10.5098 6.6788L11.7352 3.32838L17.1363 1Z'
										fill='#E2761B'
										stroke='#E2761B'
										strokeLinecap='round'
										strokeLinejoin='round'
									/>
									<path
										d='M1.83887 1L8.41214 6.73259L7.24666 3.32838L1.83887 1Z'
										fill='#E4761B'
										stroke='#E4761B'
										strokeLinecap='round'
										strokeLinejoin='round'
									/>
									<path
										d='M14.7522 14.1634L12.9873 17.2833L16.7634 18.482L17.849 14.2326L14.7522 14.1634Z'
										fill='#E4761B'
										stroke='#E4761B'
										strokeLinecap='round'
										strokeLinejoin='round'
									/>
									<path
										d='M1.13965 14.2326L2.21854 18.482L5.99467 17.2833L4.22982 14.1634L1.13965 14.2326Z'
										fill='#E4761B'
										stroke='#E4761B'
										strokeLinecap='round'
										strokeLinejoin='round'
									/>
									<path
										d='M5.78126 8.89188L4.729 10.7285L8.4785 10.9206L8.3453 6.27148L5.78126 8.89188Z'
										fill='#E4761B'
										stroke='#E4761B'
										strokeLinecap='round'
										strokeLinejoin='round'
									/>
									<path
										d='M13.1937 8.8919L10.5963 6.21771L10.5098 10.9206L14.2526 10.7285L13.1937 8.8919Z'
										fill='#E4761B'
										stroke='#E4761B'
										strokeLinecap='round'
										strokeLinejoin='round'
									/>
									<path
										d='M5.99463 17.2833L8.24566 16.0154L6.30098 14.2633L5.99463 17.2833Z'
										fill='#E4761B'
										stroke='#E4761B'
										strokeLinecap='round'
										strokeLinejoin='round'
									/>
									<path
										d='M10.73 16.0154L12.9877 17.2833L12.6746 14.2633L10.73 16.0154Z'
										fill='#E4761B'
										stroke='#E4761B'
										strokeLinecap='round'
										strokeLinejoin='round'
									/>
									<path
										d='M12.9877 17.2833L10.73 16.0154L10.9098 17.7137L10.8898 18.4283L12.9877 17.2833Z'
										fill='#D7C1B3'
										stroke='#D7C1B3'
										strokeLinecap='round'
										strokeLinejoin='round'
									/>
									<path
										d='M5.99463 17.2833L8.09248 18.4283L8.07916 17.7136L8.24566 16.0154L5.99463 17.2833Z'
										fill='#D7C1B3'
										stroke='#D7C1B3'
										strokeLinecap='round'
										strokeLinejoin='round'
									/>
									<path
										d='M8.12563 13.1414L6.24756 12.5036L7.57287 11.8043L8.12563 13.1414Z'
										fill='#233447'
										stroke='#233447'
										strokeLinecap='round'
										strokeLinejoin='round'
									/>
									<path
										d='M10.8496 13.1414L11.4024 11.8043L12.7343 12.5036L10.8496 13.1414Z'
										fill='#233447'
										stroke='#233447'
										strokeLinecap='round'
										strokeLinejoin='round'
									/>
									<path
										d='M5.99484 17.2832L6.31451 14.1634L4.22998 14.2325L5.99484 17.2832Z'
										fill='#CD6116'
										stroke='#CD6116'
										strokeLinecap='round'
										strokeLinejoin='round'
									/>
									<path
										d='M12.668 14.1634L12.9876 17.2832L14.7525 14.2325L12.668 14.1634Z'
										fill='#CD6116'
										stroke='#CD6116'
										strokeLinecap='round'
										strokeLinejoin='round'
									/>
									<path
										d='M14.2531 10.7285L10.5103 10.9206L10.8566 13.1414L11.4093 11.8043L12.7413 12.5036L14.2531 10.7285Z'
										fill='#CD6116'
										stroke='#CD6116'
										strokeLinecap='round'
										strokeLinejoin='round'
									/>
									<path
										d='M6.24794 12.5036L7.57991 11.8043L8.12601 13.1414L8.47898 10.9206L4.72949 10.7285L6.24794 12.5036Z'
										fill='#CD6116'
										stroke='#CD6116'
										strokeLinecap='round'
										strokeLinejoin='round'
									/>
									<path
										d='M4.72949 10.7285L6.30122 14.2633L6.24794 12.5036L4.72949 10.7285Z'
										fill='#E4751F'
										stroke='#E4751F'
										strokeLinecap='round'
										strokeLinejoin='round'
									/>
									<path
										d='M12.7414 12.5036L12.6748 14.2633L14.2532 10.7285L12.7414 12.5036Z'
										fill='#E4751F'
										stroke='#E4751F'
										strokeLinecap='round'
										strokeLinejoin='round'
									/>
									<path
										d='M8.47895 10.9206L8.12598 13.1414L8.56553 15.7618L8.66542 12.3114L8.47895 10.9206Z'
										fill='#E4751F'
										stroke='#E4751F'
										strokeLinecap='round'
										strokeLinejoin='round'
									/>
									<path
										d='M10.5099 10.9206L10.3301 12.3038L10.41 15.7618L10.8562 13.1414L10.5099 10.9206Z'
										fill='#E4751F'
										stroke='#E4751F'
										strokeLinecap='round'
										strokeLinejoin='round'
									/>
									<path
										d='M10.8559 13.1414L10.4097 15.7618L10.7293 16.0154L12.674 14.2633L12.7406 12.5036L10.8559 13.1414Z'
										fill='#F6851B'
										stroke='#F6851B'
										strokeLinecap='round'
										strokeLinejoin='round'
									/>
									<path
										d='M6.24756 12.5036L6.30084 14.2633L8.24552 16.0154L8.56519 15.7618L8.12564 13.1414L6.24756 12.5036Z'
										fill='#F6851B'
										stroke='#F6851B'
										strokeLinecap='round'
										strokeLinejoin='round'
									/>
									<path
										d='M10.8896 18.4283L10.9096 17.7136L10.7431 17.5445H8.23234L8.07916 17.7136L8.09248 18.4283L5.99463 17.2833L6.72721 17.9749L8.21236 19.166H10.7631L12.2549 17.9749L12.9875 17.2833L10.8896 18.4283Z'
										fill='#C0AD9E'
										stroke='#C0AD9E'
										strokeLinecap='round'
										strokeLinejoin='round'
									/>
									<path
										d='M10.7297 16.0154L10.41 15.7618H8.56527L8.2456 16.0154L8.0791 17.7136L8.23228 17.5446H10.743L10.9095 17.7136L10.7297 16.0154Z'
										fill='#161616'
										stroke='#161616'
										strokeLinecap='round'
										strokeLinejoin='round'
									/>
									<path
										d='M17.4165 7.04765L17.9825 3.9124L17.1367 1L10.73 6.48669L13.1941 8.89192L16.6772 10.0676L17.4498 9.03024L17.1168 8.7536L17.6496 8.19263L17.2366 7.82378L17.7694 7.35503L17.4165 7.04765Z'
										fill='#763D16'
										stroke='#763D16'
										strokeLinecap='round'
										strokeLinejoin='round'
									/>
									<path
										d='M1 3.9124L1.56609 7.04765L1.20646 7.35503L1.73924 7.82378L1.33299 8.19263L1.86578 8.7536L1.53279 9.03024L2.29867 10.0676L5.78177 8.89192L8.24591 6.48669L1.83914 1L1 3.9124Z'
										fill='#763D16'
										stroke='#763D16'
										strokeLinecap='round'
										strokeLinejoin='round'
									/>
									<path
										d='M16.6769 10.0676L13.1938 8.89191L14.2527 10.7285L12.6743 14.2633L14.7522 14.2326H17.849L16.6769 10.0676Z'
										fill='#F6851B'
										stroke='#F6851B'
										strokeLinecap='round'
										strokeLinejoin='round'
									/>
									<path
										d='M5.78156 8.89191L2.29846 10.0676L1.13965 14.2326H4.22982L6.30103 14.2633L4.72931 10.7285L5.78156 8.89191Z'
										fill='#F6851B'
										stroke='#F6851B'
										strokeLinecap='round'
										strokeLinejoin='round'
									/>
									<path
										d='M10.5099 10.9206L10.7297 6.48667L11.742 3.32837H7.24658L8.24556 6.48667L8.47865 10.9206L8.55857 12.3192L8.56523 15.7618H10.41L10.4233 12.3192L10.5099 10.9206Z'
										fill='#F6851B'
										stroke='#F6851B'
										strokeLinecap='round'
										strokeLinejoin='round'
									/>
								</svg>
							) : null}
						</button>
						{walletText === DISCONNECT ? (
							<button className='w-40 h-12 mt-4 flex items-center justify-center rounded-3xl py-2 px-4 bg-lumerin-light-aqua text-black'>
								{getTruncatedWalletAddress()}
								<svg
									width='19'
									height='20'
									viewBox='0 0 19 20'
									fill='none'
									xmlns='http://www.w3.org/2000/svg'
									style={{ marginLeft: '.5rem' }}
								>
									<path
										d='M17.1363 1L10.5098 6.6788L11.7352 3.32838L17.1363 1Z'
										fill='#E2761B'
										stroke='#E2761B'
										strokeLinecap='round'
										strokeLinejoin='round'
									/>
									<path
										d='M1.83887 1L8.41214 6.73259L7.24666 3.32838L1.83887 1Z'
										fill='#E4761B'
										stroke='#E4761B'
										strokeLinecap='round'
										strokeLinejoin='round'
									/>
									<path
										d='M14.7522 14.1634L12.9873 17.2833L16.7634 18.482L17.849 14.2326L14.7522 14.1634Z'
										fill='#E4761B'
										stroke='#E4761B'
										strokeLinecap='round'
										strokeLinejoin='round'
									/>
									<path
										d='M1.13965 14.2326L2.21854 18.482L5.99467 17.2833L4.22982 14.1634L1.13965 14.2326Z'
										fill='#E4761B'
										stroke='#E4761B'
										strokeLinecap='round'
										strokeLinejoin='round'
									/>
									<path
										d='M5.78126 8.89188L4.729 10.7285L8.4785 10.9206L8.3453 6.27148L5.78126 8.89188Z'
										fill='#E4761B'
										stroke='#E4761B'
										strokeLinecap='round'
										strokeLinejoin='round'
									/>
									<path
										d='M13.1937 8.8919L10.5963 6.21771L10.5098 10.9206L14.2526 10.7285L13.1937 8.8919Z'
										fill='#E4761B'
										stroke='#E4761B'
										strokeLinecap='round'
										strokeLinejoin='round'
									/>
									<path
										d='M5.99463 17.2833L8.24566 16.0154L6.30098 14.2633L5.99463 17.2833Z'
										fill='#E4761B'
										stroke='#E4761B'
										strokeLinecap='round'
										strokeLinejoin='round'
									/>
									<path
										d='M10.73 16.0154L12.9877 17.2833L12.6746 14.2633L10.73 16.0154Z'
										fill='#E4761B'
										stroke='#E4761B'
										strokeLinecap='round'
										strokeLinejoin='round'
									/>
									<path
										d='M12.9877 17.2833L10.73 16.0154L10.9098 17.7137L10.8898 18.4283L12.9877 17.2833Z'
										fill='#D7C1B3'
										stroke='#D7C1B3'
										strokeLinecap='round'
										strokeLinejoin='round'
									/>
									<path
										d='M5.99463 17.2833L8.09248 18.4283L8.07916 17.7136L8.24566 16.0154L5.99463 17.2833Z'
										fill='#D7C1B3'
										stroke='#D7C1B3'
										strokeLinecap='round'
										strokeLinejoin='round'
									/>
									<path
										d='M8.12563 13.1414L6.24756 12.5036L7.57287 11.8043L8.12563 13.1414Z'
										fill='#233447'
										stroke='#233447'
										strokeLinecap='round'
										strokeLinejoin='round'
									/>
									<path
										d='M10.8496 13.1414L11.4024 11.8043L12.7343 12.5036L10.8496 13.1414Z'
										fill='#233447'
										stroke='#233447'
										strokeLinecap='round'
										strokeLinejoin='round'
									/>
									<path
										d='M5.99484 17.2832L6.31451 14.1634L4.22998 14.2325L5.99484 17.2832Z'
										fill='#CD6116'
										stroke='#CD6116'
										strokeLinecap='round'
										strokeLinejoin='round'
									/>
									<path
										d='M12.668 14.1634L12.9876 17.2832L14.7525 14.2325L12.668 14.1634Z'
										fill='#CD6116'
										stroke='#CD6116'
										strokeLinecap='round'
										strokeLinejoin='round'
									/>
									<path
										d='M14.2531 10.7285L10.5103 10.9206L10.8566 13.1414L11.4093 11.8043L12.7413 12.5036L14.2531 10.7285Z'
										fill='#CD6116'
										stroke='#CD6116'
										strokeLinecap='round'
										strokeLinejoin='round'
									/>
									<path
										d='M6.24794 12.5036L7.57991 11.8043L8.12601 13.1414L8.47898 10.9206L4.72949 10.7285L6.24794 12.5036Z'
										fill='#CD6116'
										stroke='#CD6116'
										strokeLinecap='round'
										strokeLinejoin='round'
									/>
									<path
										d='M4.72949 10.7285L6.30122 14.2633L6.24794 12.5036L4.72949 10.7285Z'
										fill='#E4751F'
										stroke='#E4751F'
										strokeLinecap='round'
										strokeLinejoin='round'
									/>
									<path
										d='M12.7414 12.5036L12.6748 14.2633L14.2532 10.7285L12.7414 12.5036Z'
										fill='#E4751F'
										stroke='#E4751F'
										strokeLinecap='round'
										strokeLinejoin='round'
									/>
									<path
										d='M8.47895 10.9206L8.12598 13.1414L8.56553 15.7618L8.66542 12.3114L8.47895 10.9206Z'
										fill='#E4751F'
										stroke='#E4751F'
										strokeLinecap='round'
										strokeLinejoin='round'
									/>
									<path
										d='M10.5099 10.9206L10.3301 12.3038L10.41 15.7618L10.8562 13.1414L10.5099 10.9206Z'
										fill='#E4751F'
										stroke='#E4751F'
										strokeLinecap='round'
										strokeLinejoin='round'
									/>
									<path
										d='M10.8559 13.1414L10.4097 15.7618L10.7293 16.0154L12.674 14.2633L12.7406 12.5036L10.8559 13.1414Z'
										fill='#F6851B'
										stroke='#F6851B'
										strokeLinecap='round'
										strokeLinejoin='round'
									/>
									<path
										d='M6.24756 12.5036L6.30084 14.2633L8.24552 16.0154L8.56519 15.7618L8.12564 13.1414L6.24756 12.5036Z'
										fill='#F6851B'
										stroke='#F6851B'
										strokeLinecap='round'
										strokeLinejoin='round'
									/>
									<path
										d='M10.8896 18.4283L10.9096 17.7136L10.7431 17.5445H8.23234L8.07916 17.7136L8.09248 18.4283L5.99463 17.2833L6.72721 17.9749L8.21236 19.166H10.7631L12.2549 17.9749L12.9875 17.2833L10.8896 18.4283Z'
										fill='#C0AD9E'
										stroke='#C0AD9E'
										strokeLinecap='round'
										strokeLinejoin='round'
									/>
									<path
										d='M10.7297 16.0154L10.41 15.7618H8.56527L8.2456 16.0154L8.0791 17.7136L8.23228 17.5446H10.743L10.9095 17.7136L10.7297 16.0154Z'
										fill='#161616'
										stroke='#161616'
										strokeLinecap='round'
										strokeLinejoin='round'
									/>
									<path
										d='M17.4165 7.04765L17.9825 3.9124L17.1367 1L10.73 6.48669L13.1941 8.89192L16.6772 10.0676L17.4498 9.03024L17.1168 8.7536L17.6496 8.19263L17.2366 7.82378L17.7694 7.35503L17.4165 7.04765Z'
										fill='#763D16'
										stroke='#763D16'
										strokeLinecap='round'
										strokeLinejoin='round'
									/>
									<path
										d='M1 3.9124L1.56609 7.04765L1.20646 7.35503L1.73924 7.82378L1.33299 8.19263L1.86578 8.7536L1.53279 9.03024L2.29867 10.0676L5.78177 8.89192L8.24591 6.48669L1.83914 1L1 3.9124Z'
										fill='#763D16'
										stroke='#763D16'
										strokeLinecap='round'
										strokeLinejoin='round'
									/>
									<path
										d='M16.6769 10.0676L13.1938 8.89191L14.2527 10.7285L12.6743 14.2633L14.7522 14.2326H17.849L16.6769 10.0676Z'
										fill='#F6851B'
										stroke='#F6851B'
										strokeLinecap='round'
										strokeLinejoin='round'
									/>
									<path
										d='M5.78156 8.89191L2.29846 10.0676L1.13965 14.2326H4.22982L6.30103 14.2633L4.72931 10.7285L5.78156 8.89191Z'
										fill='#F6851B'
										stroke='#F6851B'
										strokeLinecap='round'
										strokeLinejoin='round'
									/>
									<path
										d='M10.5099 10.9206L10.7297 6.48667L11.742 3.32837H7.24658L8.24556 6.48667L8.47865 10.9206L8.55857 12.3192L8.56523 15.7618H10.41L10.4233 12.3192L10.5099 10.9206Z'
										fill='#F6851B'
										stroke='#F6851B'
										strokeLinecap='round'
										strokeLinejoin='round'
									/>
								</svg>
							</button>
						) : null}

						<div className='ml-4 flex items-center hidden'>
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
