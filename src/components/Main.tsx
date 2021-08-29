import { Fragment, useEffect, useState } from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Dialog, Transition } from '@headlessui/react';
import { MenuAlt2Icon, XIcon } from '@heroicons/react/outline';
import { ReactComponent as MarketplaceIcon } from '../images/marketplace.svg';
import { ReactComponent as MyOrdersIcon } from '../images/myorders.svg';
import { ReactComponent as MetaMaskIcon } from '../images/metamask.svg';
import { ReactComponent as LogoIcon } from '../images/logo.svg';
import { ReactComponent as LumerinIcon } from '../images/lumerin.svg';
import { Alert } from './ui/Alert';
import { Modal } from './ui/Modal';
import { Marketplace } from './Marketplace';
import { Contract } from 'web3-eth-contract';
import { BuyForm } from './ui/BuyForms/BuyForm';
import { PageName } from '../App';
import { Data } from './Marketplace';
import { Spinner } from './ui/Spinner';
import { getWeb3ResultAsync } from '../web3/getWeb3ResultAsync';
import { classNames, truncateAddress } from '../utils';
import { reconnectWallet } from '../web3/utils';
import { useInterval } from './hooks/useInterval';

export enum WalletText {
	ConnectViaMetaMask = 'Connect Via MetaMask',
	Disconnect = 'Disconnect',
}

interface MainProps extends RouteComponentProps {
	pageName: string;
}

// Main contains the basic layout of pages and maintains contract state needed by its children
export const Main: React.FC<MainProps> = ({ location, pageName }) => {
	// state and constants
	const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
	const [walletText, setWalletText] = useState<string>(WalletText.ConnectViaMetaMask);
	const [accounts, setAccounts] = useState<string[]>();
	const [contractInstance, setContractInstance] = useState<Contract>();
	const [contracts, setContracts] = useState<HashRentalContract[]>([]);
	const [alertOpen, setAlertOpen] = useState<boolean>(false);
	const [buyModalOpen, setBuyModalOpen] = useState<boolean>(false);

	// navigation
	interface Navigation {
		name: string;
		to: string;
		icon: JSX.Element;
		current: boolean;
	}

	const navigation: Navigation[] = [
		{ name: 'Marketplace', to: '/', icon: <MarketplaceIcon />, current: location.pathname === '/' },
		{ name: 'My Orders', to: 'orders', icon: <MyOrdersIcon />, current: location.pathname === '/orders' },
	];

	// Wallet setup
	const connectWallet = async () => {
		const web3Result = await getWeb3ResultAsync(setAlertOpen, setWalletText);
		if (web3Result) {
			const { accounts, contractInstance } = web3Result;
			setAccounts(accounts);
			setContractInstance(contractInstance);
			setWalletText(WalletText.Disconnect);
		}
	};

	const walletClickHandler: React.MouseEventHandler<HTMLButtonElement> = async (event) => {
		if (walletText === WalletText.ConnectViaMetaMask) {
			connectWallet();
		} else {
			reconnectWallet();
			setWalletText(WalletText.ConnectViaMetaMask);
		}
	};

	const getTruncatedWalletAddress: () => string | null = () => {
		if (walletText === WalletText.Disconnect && accounts) {
			return truncateAddress(accounts[0]);
		}

		return null;
	};

	// create contracts
	interface HashRentalContract extends Data {}
	const createContractAsync: (address: string) => Promise<HashRentalContract> = async (address) => {
		const price = await contractInstance?.methods.getAddressPrice(address).call();
		const limit = await contractInstance?.methods.getAddressLimit(address).call();
		const speed = await contractInstance?.methods.getAddressSpeed(address).call();
		const length = await contractInstance?.methods.getAddressLength(address).call();

		return {
			id: address,
			price,
			limit,
			speed,
			length,
		} as HashRentalContract;
	};

	const getContractDataAsync: (addresses: string[]) => void = async (addresses) => {
		const hashRentalContracts: HashRentalContract[] = [];
		for await (const address of addresses) {
			const contract = await createContractAsync(address);
			if (contract) hashRentalContracts.push(contract);
		}
		setContracts(hashRentalContracts);
	};

	const createContractsAsync = async () => {
		const addresses: string[] = await contractInstance?.methods.getContractList().call();
		if (addresses) {
			getContractDataAsync(addresses);
		}
	};
	createContractsAsync(); // initial load

	// get contracts at set interval of 20 seconds
	// TODO: listen to event instead
	useInterval(() => {
		createContractsAsync();
	}, 20000);

	// check if MetaMask is connected
	useEffect(() => {
		if (walletText === WalletText.ConnectViaMetaMask) reconnectWallet();
	}, [walletText]);

	// Buy contract setup
	const buyClickHandler: React.MouseEventHandler<HTMLButtonElement> = (event) => {
		if (!buyModalOpen) setBuyModalOpen(true);
	};

	// when a user disconnects MetaMask, alertOpen will be true
	useEffect(() => {
		if (alertOpen) setWalletText(WalletText.ConnectViaMetaMask);
	}, [alertOpen]);

	const ActionButton: JSX.Element = (
		<button type='button' className='btn-wallet w-60 h-12 mt-4 mb-20 rounded-3xl bg-lumerin-aqua text-sm font-Inter' onClick={walletClickHandler}>
			<span className='mr-4'>{WalletText.ConnectViaMetaMask}</span>
			<MetaMaskIcon />
		</button>
	);

	const getContent: (pageName: string, contracts: HashRentalContract[]) => JSX.Element = (pageName, contracts) => {
		if (contracts.length === 0) {
			return (
				<div className='flex flex-col justify-center items-center h-full'>
					{ActionButton}
					<Spinner />
				</div>
			);
		}
		if (pageName === PageName.Marketplace) return <Marketplace contracts={contracts} buyClickHandler={buyClickHandler} />;
		if (pageName === PageName.MyOrders) return <div>My Orders</div>;
		return <Marketplace contracts={contracts} buyClickHandler={buyClickHandler} />;
	};
	const content: JSX.Element = getContent(pageName, contracts);

	return (
		<div id='main' className='h-screen flex overflow-hidden bg-gray-100'>
			<Alert message={'MetaMask is not connected'} open={alertOpen} setOpen={setAlertOpen} />
			<Modal open={buyModalOpen} setOpen={setBuyModalOpen} content={<BuyForm />} />
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
							<LogoIcon />
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
								walletText === WalletText.Disconnect
									? 'w-40 h-12 mt-4 mr-2 py-2 px-4 border border-solid border-lumerin-aqua rounded-3xl bg-white text-sm text-lumerin-aqua font-Inter'
									: 'btn-wallet w-60 h-12 mt-4 rounded-3xl bg-lumerin-aqua text-sm font-Inter'
							)}
							onClick={walletClickHandler}
						>
							<span className={classNames(walletText === WalletText.ConnectViaMetaMask ? 'mr-4' : '')}>{walletText}</span>
							{walletText === WalletText.ConnectViaMetaMask ? <MetaMaskIcon /> : null}
						</button>
						{walletText === WalletText.Disconnect ? (
							<div className='flex'>
								<button className='w-40 h-12 mt-4 mr-2 flex items-center justify-center rounded-3xl py-2 px-4 bg-lumerin-light-aqua text-sm text-black font-medium'>
									<LumerinIcon />
									<span className='ml-4'>3,409 LMRN</span>
								</button>
								<button className='w-40 h-12 mt-4 flex items-center justify-center rounded-3xl py-2 px-4 bg-lumerin-light-aqua text-sm text-black font-medium'>
									<span className='mr-4'>{getTruncatedWalletAddress()}</span>
									<MetaMaskIcon />
								</button>
							</div>
						) : null}
					</div>
				</div>

				<main className='ml-16 md:ml-4 lg:ml-0 mr-4 flex-1 relative overflow-y-auto focus:outline-none bg-lumerin-gray border border-transparent rounded-50'>
					{content}
				</main>
			</div>
		</div>
	);
};

Main.displayName = 'Main';
(Main as any).whyDidYouRender = false;
