import { Fragment, useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { MenuAlt2Icon, XIcon } from '@heroicons/react/outline';
import { getWeb3ResultAsync } from '../web3/getWeb3ResultAsync';
import { classNames, truncateWalletAddress } from '../utils';
import { ReactComponent as Marketplace } from '../images/marketplace.svg';
import { ReactComponent as MyOrders } from '../images/myorders.svg';
import { ReactComponent as MetaMask } from '../images/metamask.svg';
import { ReactComponent as Logo } from '../images/logo.svg';
import { Alert } from './ui/Alert';
import { disconnectWallet } from '../web3/utils';
import { Link, RouteComponentProps } from 'react-router-dom';
import { ContractTable } from './ContractTable';
import { Contract } from 'web3-eth-contract';
import Web3 from 'web3';

export const Layout: React.FC<RouteComponentProps> = ({ location }) => {
	// state and constants
	const CONNECT_VIA_METAMASK = 'Connect Via MetaMask';
	const DISCONNECT = 'Disconnect';
	const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
	const [walletText, setWalletText] = useState<string>(CONNECT_VIA_METAMASK);
	const [web3, setWeb3] = useState<Web3>();
	const [accounts, setAccounts] = useState<string[]>();
	const [instance, setInstance] = useState<Contract>();
	const [alertOpen, setAlertOpen] = useState<boolean>(false);

	// navigation
	interface Navigation {
		name: string;
		to: string;
		icon: JSX.Element;
		current: boolean;
	}

	const navigation: Navigation[] = [
		{ name: 'Marketplace', to: '/', icon: <Marketplace />, current: location.pathname === '/' },
		{ name: 'My Orders', to: 'orders', icon: <MyOrders />, current: location.pathname === '/orders' },
	];

	// Wallet setup
	const connectWallet = async () => {
		const web3Result = await getWeb3ResultAsync(setAlertOpen);
		if (web3Result) {
			const { accounts, instance, web3 } = web3Result;
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
						<div className='relative flex-1 flex flex-col max-w-xs w-full pt-5 pb-4 bg-white'>
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
										<Link
											key={item.name}
											to={item.to}
											className={classNames(
												item.current ? 'text-lumerin-aqua' : 'text-black',
												'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
											)}
										>
											{item.icon}
											<span className='ml-4'>{item.name}</span>
										</Link>
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
					<div className='flex flex-col pt-4 pb-4 overflow-y-auto'>
						<div className='flex-1 flex flex-col ml-4 mb-16'>
							<Logo />
						</div>
						<div className='flex-1 flex flex-col'>
							<nav className='flex-1 px-2 space-y-1'>
								{navigation.map((item) => (
									<Link
										key={item.name}
										to={item.to}
										className={classNames(
											item.current ? 'text-lumerin-aqua' : 'text-black',
											'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
										)}
									>
										{item.icon}
										<span className='ml-4'>{item.name}</span>
									</Link>
								))}
							</nav>
						</div>
					</div>
				</div>
			</div>
			<div className='flex flex-col w-0 flex-1 overflow-hidden bg-white'>
				<div className='relative z-10 flex-shrink-0 flex h-20 bg-white'>
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
							<span className={classNames(walletText === CONNECT_VIA_METAMASK ? 'mr-4' : '')}>{walletText}</span>
							{walletText === CONNECT_VIA_METAMASK ? <MetaMask /> : null}
						</button>
						{walletText === DISCONNECT ? (
							<button className='w-40 h-12 mt-4 flex items-center justify-center rounded-3xl py-2 px-4 bg-lumerin-light-aqua text-black font-medium'>
								<span className='mr-4'>{getTruncatedWalletAddress()}</span>
								<MetaMask />
							</button>
						) : null}
					</div>
				</div>

				<main className='ml-16 md:ml-4 lg:ml-0 mr-4 flex-1 relative overflow-y-auto focus:outline-none bg-lumerin-gray border border-transparent rounded-4xl'>
					<ContractTable />
				</main>
			</div>
		</div>
	);
};

Layout.displayName = 'Layout';
(Layout as any).whyDidYouRender = false;
