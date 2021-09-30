import { Fragment, Suspense, useEffect, useState } from 'react';
import { Link, Route, RouteComponentProps, Switch } from 'react-router-dom';
import { Dialog, Transition } from '@headlessui/react';
import { MenuAlt2Icon, XIcon } from '@heroicons/react/outline';
import { ReactComponent as MarketplaceIcon } from '../images/marketplace.svg';
import { ReactComponent as MyOrdersIcon } from '../images/myorders.svg';
import { ReactComponent as MetaMaskIcon } from '../images/metamask.svg';
import { ReactComponent as LogoIcon } from '../images/logo.svg';
import { ReactComponent as LumerinIcon } from '../images/lumerin.svg';
import { ReactComponent as CreateContractIcon } from '../images/contract.svg';
import { Alert } from './ui/Alert';
import { Modal } from './ui/Modal';
import { Marketplace } from './Marketplace';
import { Contract } from 'web3-eth-contract';
import { BuyForm } from './ui/BuyForms/BuyForm';
import { MarketPlaceData } from './Marketplace';
import { MyOrders, MyOrdersData } from './MyOrders';
import { Spinner } from './ui/Spinner';
import { useInterval } from './hooks/useInterval';
import { addLumerinTokenToMetaMaskAsync, getLumerinTokenBalanceAsync, getWeb3ResultAsync, reconnectWalletAsync } from '../web3/helpers';
import { AddressLength, classNames, truncateAddress } from '../utils';
import { DateTime } from 'luxon';
import MetaMaskOnboarding from '@metamask/onboarding';
import Web3 from 'web3';
import { EventData } from 'web3-eth-contract';
import axios from 'axios';
import { printError } from '../utils';
import { CreateForm } from './ui/CreateForms/CreateForm';
import _ from 'lodash';

enum PathName {
	Marketplace = '/',
	MyOrders = '/myorders',
}

// Used in `eventListeners.ts`
export enum WalletText {
	ConnectViaMetaMask = 'Connect Via MetaMask',
	Disconnect = 'Disconnect',
}

interface Navigation {
	name: string;
	to: string;
	icon: JSX.Element;
	current: boolean;
}

interface ValidatorResponse {
	hashes_done: number;
}

export interface HashRentalContract extends MarketPlaceData {}
export interface MyOrder extends MyOrdersData {}

// Main contains the basic layout of pages and maintains contract state needed by its children
export const Main: React.FC = () => {
	// State and constants
	const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
	const [walletText, setWalletText] = useState<string>(WalletText.ConnectViaMetaMask);
	const [web3, setWeb3] = useState<Web3>();
	const [accounts, setAccounts] = useState<string[]>();
	const [marketplaceContract, setMarketplaceContract] = useState<Contract>();
	const [addresses, setAddresses] = useState<string[]>([]);
	const [contracts, setContracts] = useState<HashRentalContract[]>([]);
	const [contractId, setContractId] = useState<string>('');
	const [myOrders, setMyOrders] = useState<MyOrder[]>([]);
	const [lumerinBalance, setLumerinBalance] = useState<number>(0);
	const [alertOpen, setAlertOpen] = useState<boolean>(false);
	const [buyModalOpen, setBuyModalOpen] = useState<boolean>(false);
	const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);
	const [toggle, setToggle] = useState<boolean>(false);

	const userAccount = accounts && accounts[0] ? accounts[0] : '';

	// Navigation setup
	const pathName = window.location.pathname;
	const navigation: Navigation[] = [
		{ name: 'Marketplace', to: '/', icon: <MarketplaceIcon />, current: pathName === '/' },
		{ name: 'My Orders', to: 'myorders', icon: <MyOrdersIcon />, current: pathName === '/myorders' },
	];
	// Stage 2 functionality
	const createContractNav: JSX.Element = (
		<div
			className='text-black flex items-center px-2 py-2 text-sm font-medium rounded-md cursor-pointer'
			onClick={() => {
				setCreateModalOpen(true);
				setSidebarOpen(false);
			}}
		>
			<CreateContractIcon />
			<span className='ml-4'>Create Contract</span>
		</div>
	);

	// Wallet/MetaMask setup
	// Get accounts, web3 and contract instances
	const onboarding = new MetaMaskOnboarding();
	const connectWallet: () => void = async () => {
		const web3Result = await getWeb3ResultAsync(setAlertOpen, setWalletText, setAccounts);
		if (web3Result) {
			const { accounts, contractInstance, web3 } = web3Result;
			setAccounts(accounts);
			setMarketplaceContract(contractInstance);
			setWeb3(web3);
			setWalletText(WalletText.Disconnect);
		}
	};

	// Onboard metamask and set wallet text
	const walletClickHandler: React.MouseEventHandler<HTMLButtonElement> = async (event) => {
		// Onboard metamask if not installed
		if (!MetaMaskOnboarding.isMetaMaskInstalled()) {
			onboarding.startOnboarding();
		} else {
			onboarding.stopOnboarding();
		}

		if (walletText === WalletText.ConnectViaMetaMask) {
			connectWallet();
		} else {
			reconnectWalletAsync();
			setWalletText(WalletText.ConnectViaMetaMask);
		}
	};

	const getTruncatedWalletAddress: () => string | null = () => {
		if (walletText === WalletText.Disconnect && userAccount) {
			return truncateAddress(userAccount, AddressLength.medium);
		}

		return null;
	};

	// When a user disconnects MetaMask, alertOpen will be true
	useEffect(() => {
		if (alertOpen) setWalletText(WalletText.ConnectViaMetaMask);
	}, [alertOpen]);

	// Contracts setup
	const createContractAsync: (address: string) => Promise<HashRentalContract> = async (address) => {
		const [price, limit, speed, length] = await marketplaceContract?.methods.getContractVariables(address).call();

		return {
			id: address,
			price,
			limit,
			speed,
			length, // TODO: how is unit returned (e.g. hr,d,w)?
		} as HashRentalContract;
	};

	// Don't allow duplicates for active contracts:
	// this only occurs with test contract and check won't be needed in production
	const hasContract: (contract: HashRentalContract) => boolean = (contract) => {
		if (contracts.length > 0) {
			const filteredContracts = contracts.filter((existingContract) => existingContract.id === contract.id);
			return filteredContracts.length === 0;
		}
		return false;
	};

	const addContractsAsync: (addresses: string[]) => void = async (addresses) => {
		const hashRentalContracts: HashRentalContract[] = [];
		for await (const address of addresses) {
			const contract = await createContractAsync(address);

			if (contract && !hasContract(contract)) hashRentalContracts.push(contract);
		}

		// add empty row for styling
		hashRentalContracts.unshift({});
		// update contracts if deep equality is false
		if (!_.isEqual(contracts, hashRentalContracts)) {
			setContracts(hashRentalContracts);
		}
	};

	// Orders setup
	const createContractsAsync: () => void = async () => {
		try {
			const addresses: string[] = await marketplaceContract?.methods.getContractList().call();
			if (addresses) {
				setAddresses(addresses);
				addContractsAsync(addresses);
			}
		} catch (error) {
			const typedError = error as Error;
			printError(typedError.message, typedError.stack as string);
			// crash app if can't communicate with webfacing contract
			throw typedError;
		}
	};

	const createMyOrderAsync: (contractAddress: string, timestamp: string) => Promise<MyOrder | null> = async (contractAddress, timestamp) => {
		try {
			const response = await axios.get(`http://44.234.253.47:7545/completionStatus/${contractAddress}`);
			const delivered = (response.data as ValidatorResponse).hashes_done.toFixed();
			const contractState: string = await marketplaceContract?.methods.getState(contractAddress).call();
			return {
				id: contractAddress,
				started: DateTime.fromSeconds(parseInt(timestamp)).toFormat('MM/dd/yyyy hh:mm:ss'),
				status: contractState,
				delivered: `${delivered}/100`,
			} as MyOrder;
		} catch (error) {
			const typedError = error as Error;
			printError(typedError.message, typedError.stack as string);
			// don't crash app if validator api is down
			if (typedError.message !== 'Network Error') throw typedError;
			return null;
		}
	};

	const addMyOrderAsync: (events: EventData[]) => void = async (events) => {
		const myContractOrders: MyOrder[] = [];
		// filter contracts by userAccount
		const eventsForAddress = events.filter((event) => userAccount.toLowerCase() === (event.returnValues._buyer as string).toLowerCase());
		for await (const event of eventsForAddress) {
			// get block to use its timestamp
			const block = await web3?.eth.getBlock(event.blockNumber);
			const myOrder = await createMyOrderAsync(event.returnValues._contractAddress as string, block?.timestamp as string);
			if (myOrder) myContractOrders.push(myOrder);
		}

		// add empty row for styling
		myContractOrders.unshift({});
		if (!_.isEqual(myOrders, myContractOrders)) {
			setMyOrders(myContractOrders);
		}
	};

	const createMyOrdersAsync: () => void = async () => {
		try {
			// TODO: have event index buyer address to filter by
			const events = await marketplaceContract?.getPastEvents('contractPurchased', {
				fromBlock: 0, // TODO: update to block# when marketplace is deployed
				toBlock: 'latest',
			});
			if (events) addMyOrderAsync(events);
		} catch (error) {
			const typedError = error as Error;
			printError(typedError.message, typedError.stack as string);
			// Crash app bc events should exist
			throw typedError;
		}
	};

	// Get Lumerin token balance
	const updateLumerinTokenBalanceAsync: () => void = async () => {
		if (web3) {
			const lumerinTokenBalance = await getLumerinTokenBalanceAsync(web3, userAccount);
			if (lumerinTokenBalance) setLumerinBalance(lumerinTokenBalance);
		}
	};
	useEffect(() => updateLumerinTokenBalanceAsync(), [web3, accounts]);

	// Set contracts and orders once marketplaceContract exists
	useEffect(() => createContractsAsync(), [marketplaceContract, accounts]);

	// Set orders once addresses have been retrieved
	useEffect(() => createMyOrdersAsync(), [addresses, accounts]);

	// Get contracts at interval of 20 seconds
	useInterval(() => {
		createContractsAsync();
		createMyOrdersAsync();
	}, 20000);

	// Content setup
	const ActionButton: JSX.Element = (
		<button type='button' className='btn-wallet w-60 h-12 mt-4 mb-20 rounded-5 bg-lumerin-aqua text-sm font-Inter' onClick={walletClickHandler}>
			<span className='mr-4'>{WalletText.ConnectViaMetaMask}</span>
			<MetaMaskIcon />
		</button>
	);

	const routes = (
		<Suspense fallback={<Spinner />}>
			<Switch>
				<Route path='/myorders' exact render={(props: RouteComponentProps) => <MyOrders {...props} orders={myOrders} />} />
				<Route
					path='/'
					render={(props: RouteComponentProps) => (
						<Marketplace {...props} contracts={contracts} setContractId={setContractId} buyClickHandler={buyClickHandler} />
					)}
				/>
			</Switch>
		</Suspense>
	);

	const getContent: (contracts: HashRentalContract[]) => JSX.Element = (contracts) => {
		if (contracts.length === 0 && myOrders.length === 0 && PathName.MyOrders) {
			return (
				<div className='flex flex-col justify-center items-center h-full'>
					{ActionButton}
					<Spinner />
				</div>
			);
		}
		return routes;
	};

	// <Marketplace /> click handler
	const buyClickHandler: React.MouseEventHandler<HTMLButtonElement> = (event) => {
		if (!buyModalOpen) setBuyModalOpen(true);
	};

	// Hide top right button if no contracts
	const buttonDisplay = contracts.length === 0 ? 'hidden' : 'flex-1 px-4 flex justify-end';

	return (
		<div id='main' className='h-screen flex overflow-hidden'>
			<Alert message={'MetaMask is not connected'} open={alertOpen} setOpen={setAlertOpen} />
			<Modal
				open={buyModalOpen}
				setOpen={setBuyModalOpen}
				content={
					<BuyForm
						contracts={contracts}
						contractId={contractId}
						userAccount={userAccount}
						marketplaceContract={marketplaceContract}
						web3={web3}
						setOpen={setBuyModalOpen}
					/>
				}
			/>
			<Modal
				open={createModalOpen}
				setOpen={setCreateModalOpen}
				content={<CreateForm userAccount={userAccount} marketplaceContract={marketplaceContract} web3={web3} setOpen={setCreateModalOpen} />}
			/>
			<Transition.Root show={sidebarOpen} as={Fragment}>
				<Dialog as='div' static className='fixed inset-0 flex z-40 md:hidden' open={sidebarOpen} onClose={setSidebarOpen}>
					<Transition.Child
						as={Fragment}
						enter='transition-opacity ease-linear duration-300'
						enterFrom='entertfrom-leaveto-opacity'
						enterTo='enterto-enterleave-opacity'
						leave='transition-opacity ease-linear duration-300'
						leaveFrom='enterto-enterleave-opacity'
						leaveTo='entertfrom-leaveto-opacity'
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
								enterFrom='entertfrom-leaveto-opacity'
								enterTo='enterto-enterleave-opacity'
								leave='ease-in-out duration-300'
								leaveFrom='enterto-enterleave-opacity'
								leaveTo='entertfrom-leaveto-opacity'
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
												'flex items-center px-2 py-2 text-sm font-medium rounded-md'
											)}
											onClick={() => {
												setToggle(!toggle);
											}}
										>
											{item.icon}
											<span className='ml-4'>{item.name}</span>
										</Link>
									))}
									{createContractNav}
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
											'flex items-center px-2 py-2 text-sm font-medium rounded-md'
										)}
										onClick={() => setToggle(!toggle)}
									>
										{item.icon}
										<span className='ml-4'>{item.name}</span>
									</Link>
								))}
								{createContractNav}
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
					<div className={buttonDisplay}>
						<button
							type='button'
							className={classNames(
								walletText === WalletText.Disconnect
									? 'w-40 h-12 mt-4 mr-2 py-2 px-4 border border-solid border-lumerin-aqua rounded-5 bg-white text-sm text-lumerin-aqua font-Inter'
									: 'btn-wallet w-60 h-12 mt-4 rounded-5 bg-lumerin-aqua text-sm font-Inter'
							)}
							onClick={walletClickHandler}
						>
							<span className={classNames(walletText === WalletText.ConnectViaMetaMask ? 'mr-4' : '')}>{walletText}</span>
							{walletText === WalletText.ConnectViaMetaMask ? <MetaMaskIcon /> : null}
						</button>
						{walletText === WalletText.Disconnect ? (
							<div className='flex'>
								<button className='btn-connected mr-2' onClick={() => addLumerinTokenToMetaMaskAsync()}>
									<LumerinIcon />
									<span className='ml-3'>{lumerinBalance} LMR</span>
								</button>
								<button className='btn-connected cursor-default'>
									<span className='mr-4'>{getTruncatedWalletAddress()}</span>
									<MetaMaskIcon />
								</button>
							</div>
						) : null}
					</div>
				</div>

				<main className='ml-16 md:ml-4 lg:ml-0 mr-4 flex-1 relative overflow-y-auto focus:outline-none'>{getContent(contracts)}</main>
			</div>
		</div>
	);
};

Main.displayName = 'Main';
Main.whyDidYouRender = true;
