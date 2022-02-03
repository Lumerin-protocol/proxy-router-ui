/* eslint-disable react-hooks/exhaustive-deps */
import { Fragment, Suspense, useEffect, useState } from 'react';
import { Link, Route, RouteComponentProps, Switch } from 'react-router-dom';
import { Dialog, Transition } from '@headlessui/react';
import { MenuAlt2Icon, XIcon } from '@heroicons/react/outline';
import { ContractIcon, MarketplaceIcon, MyOrdersIcon, MetaMaskIcon, LogoIcon, LogoIcon2, LumerinIcon, LumerinLandingPage } from '../images/index';
import ImplementationContract from '../contracts/Implementation.json';
import { AbiItem } from 'web3-utils';
import { Alert } from './ui/Alert';
import { Modal } from './ui/Modal';
import { Marketplace } from './Marketplace';
import { Contract } from 'web3-eth-contract';
import { BuyForm } from './ui/Forms/BuyerForms/BuyForm';
import { MyOrders } from './MyOrders';
import { MyContracts } from './MyContracts';
import { Spinner } from './ui/Spinner';
import { useInterval } from './hooks/useInterval';
import { addLumerinTokenToMetaMaskAsync, getLumerinTokenBalanceAsync, getWeb3ResultAsync, reconnectWalletAsync } from '../web3/helpers';
import { buttonClickHandler, classNames, truncateAddress } from '../utils';
import MetaMaskOnboarding from '@metamask/onboarding';
import Web3 from 'web3';
import { printError } from '../utils';
import { CreateForm } from './ui/Forms/SellerForms/CreateForm';
import { AddressLength, AlertMessage, ContractState, Ethereum, HashRentalContract, PathName, WalletText } from '../types';
import { EditForm as SellerEditForm } from './ui/Forms/SellerForms/EditForm';
import { EditForm as BuyerEditForm } from './ui/Forms/BuyerForms/EditForm';
import { CancelForm } from './ui/Forms/BuyerForms/CancelForm';
import { ClaimLmrForm } from './ui/Forms/SellerForms/ClaimLmrForm';
import _ from 'lodash';

interface Navigation {
	name: string;
	to: string;
	icon: JSX.Element;
	current: boolean;
}

// Main contains the basic layout of pages and maintains contract state needed by its children
export const Main: React.FC = () => {
	// State and constants
	// TODO: as webapp grows think of using context
	const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
	const [walletText, setWalletText] = useState<string>(WalletText.ConnectViaMetaMask);
	const [web3, setWeb3] = useState<Web3>();
	const [accounts, setAccounts] = useState<string[]>();
	const [cloneFactoryContract, setCloneFactoryContract] = useState<Contract>();
	const [contracts, setContracts] = useState<HashRentalContract[]>([]);
	const [contractId, setContractId] = useState<string>('');
	const [currentBlockTimestamp, setCurrentBlockTimestamp] = useState<number>(0);
	const [lumerinBalance, setLumerinBalance] = useState<number>(0);
	const [alertOpen, setAlertOpen] = useState<boolean>(false);
	const [buyModalOpen, setBuyModalOpen] = useState<boolean>(false);
	const [sellerEditModalOpen, setSellerEditModalOpen] = useState<boolean>(false);
	const [buyerEditModalOpen, setBuyerEditModalOpen] = useState<boolean>(false);
	const [cancelModalOpen, setCancelModalOpen] = useState<boolean>(false);
	const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);
	const [claimLmrModalOpen, setClaimLmrModalOpen] = useState<boolean>(false);
	const [toggle, setToggle] = useState<boolean>(false);

	const userAccount = accounts && accounts[0] ? accounts[0] : '';
	const ethereum = window.ethereum as Ethereum;
	const isCorrectNetwork = ethereum?.networkVersion === '3';

	// Navigation setup
	const pathName = window.location.pathname;
	const navigation: Navigation[] = [
		{ name: 'Marketplace', to: PathName.Marketplace, icon: <MarketplaceIcon />, current: pathName === PathName.Marketplace },
		{ name: 'My Orders', to: PathName.MyOrders, icon: <MyOrdersIcon />, current: pathName === PathName.MyOrders },
		{ name: 'My Contracts', to: PathName.MyContracts, icon: <ContractIcon />, current: pathName === PathName.MyContracts },
	];

	// Wallet/MetaMask setup
	// Get accounts, web3 and contract instances
	const onboarding = new MetaMaskOnboarding();
	const connectWallet: () => void = async () => {
		const web3Result = await getWeb3ResultAsync(setAlertOpen, setWalletText, setAccounts);
		if (web3Result) {
			if (ethereum.networkVersion !== '3') setAlertOpen(true);
			const { accounts, contractInstance, web3 } = web3Result;
			setAccounts(accounts);
			setCloneFactoryContract(contractInstance);
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
		if (userAccount) {
			return truncateAddress(userAccount, AddressLength.LONG);
		}

		return null;
	};

	// When a user disconnects MetaMask, alertOpen will be true
	useEffect(() => {
		if (alertOpen) setWalletText(WalletText.ConnectViaMetaMask);
	}, [alertOpen]);

	// Get timestamp of current block
	const getCurrentBlockTimestampAsync: () => void = async () => {
		const currentBlockTimestamp = (await web3?.eth.getBlock('latest'))?.timestamp;
		setCurrentBlockTimestamp(currentBlockTimestamp as number);
	};

	useEffect(() => getCurrentBlockTimestampAsync(), [web3]);

	// Contracts setup
	const createContractAsync: (address: string) => Promise<HashRentalContract | null> = async (address) => {
		if (web3) {
			const implementationContractInstance = new web3.eth.Contract(ImplementationContract.abi as AbiItem[], address);
			const {
				0: state,
				1: price,
				2: limit,
				3: speed,
				4: length,
				5: timestamp,
				6: buyer,
				7: seller,
				8: encryptedPoolData,
			} = await implementationContractInstance.methods.getPublicVariables().call();

			return {
				id: address,
				price,
				speed,
				length,
				buyer,
				seller,
				timestamp,
				state,
				encryptedPoolData,
			} as HashRentalContract;
		}

		return null;
	};

	const addContractsAsync: (addresses: string[]) => void = async (addresses) => {
		const hashRentalContracts: HashRentalContract[] = [];
		for await (const address of addresses) {
			const contract = await createContractAsync(address);

			if (contract) hashRentalContracts.push(contract);
		}

		// Update contracts if deep equality is false
		if (!_.isEqual(contracts, hashRentalContracts)) setContracts(hashRentalContracts);
	};

	const createContractsAsync: () => void = async () => {
		try {
			const addresses: string[] = await cloneFactoryContract?.methods.getContractList().call();
			if (addresses) {
				addContractsAsync(addresses);
			}
		} catch (error) {
			const typedError = error as Error;
			printError(typedError.message, typedError.stack as string);
			// crash app if can't communicate with webfacing contract
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

	useEffect(() => {
		if (isCorrectNetwork) updateLumerinTokenBalanceAsync();
	}, [web3, accounts]);

	// Set contracts and orders once cloneFactoryContract exists
	useEffect(() => {
		if (isCorrectNetwork) createContractsAsync();
	}, [cloneFactoryContract, accounts, web3]);

	// Get contracts at interval of 5 seconds
	useInterval(() => {
		if (isCorrectNetwork) createContractsAsync();
	}, 5000);

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
				<Route
					path={PathName.MyOrders}
					exact
					render={(props: RouteComponentProps) => (
						<MyOrders
							{...props}
							web3={web3}
							userAccount={userAccount}
							contracts={contracts}
							currentBlockTimestamp={currentBlockTimestamp}
							setContractId={setContractId}
							editClickHandler={(event) => buttonClickHandler(event, buyerEditModalOpen, setBuyerEditModalOpen)}
							cancelClickHandler={(event) => buttonClickHandler(event, cancelModalOpen, setCancelModalOpen)}
						/>
					)}
				/>
				<Route
					path={PathName.MyContracts}
					render={(props: RouteComponentProps) => (
						<MyContracts
							{...props}
							web3={web3}
							userAccount={userAccount}
							contracts={contracts}
							currentBlockTimestamp={currentBlockTimestamp}
							setContractId={setContractId}
							editClickHandler={(event) => buttonClickHandler(event, sellerEditModalOpen, setSellerEditModalOpen)}
							claimLmrClickHandler={(event) => buttonClickHandler(event, claimLmrModalOpen, setClaimLmrModalOpen)}
						/>
					)}
				/>
				<Route
					path={PathName.Marketplace}
					render={(props: RouteComponentProps) => (
						<Marketplace
							{...props}
							web3={web3}
							contracts={contracts}
							setContractId={setContractId}
							buyClickHandler={(event) => buttonClickHandler(event, buyModalOpen, setBuyModalOpen)}
						/>
					)}
				/>
			</Switch>
		</Suspense>
	);

	const getContent: () => JSX.Element = () => {
		if (walletText === WalletText.ConnectViaMetaMask) {
			return (
				<div className='flex flex-col items-center mt-20 md:mt-40 xl:mr-50 gap-4 text-center'>
					<LumerinLandingPage />
					<p className='mt-4 text-3xl md:text-50 text-lumerin-landing-page font-medium'>Global Hashpower Marketplace</p>
					<p className='text-lg text-lumerin-landing-page'>Buy hashpower from an open, easy to use, marketplace.</p>
					<div>{ActionButton}</div>
				</div>
			);
		}
		return routes;
	};

	// Hide top right button if no contracts
	const buttonDisplay = contracts.length === 0 ? 'hidden' : 'flex-1 px-4 flex justify-end';

	const getPageTitle: () => string = () => {
		if (contracts.length === 0) return '';
		if (pathName === PathName.Marketplace) return 'Marketplace';
		if (pathName === PathName.MyOrders) return 'My Orders';
		if (pathName === PathName.MyContracts) return 'My Contracts';
		return '';
	};

	const changeNetworkAsync: () => void = async () => {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		await ethereum.request({
			method: 'wallet_switchEthereumChain',
			params: [{ chainId: web3?.utils.toHex(3) }],
		});
		setAlertOpen(false);
		connectWallet();
	};

	const isAvailableContract: boolean = contracts.filter((contract) => contract.state === ContractState.Available).length > 0;

	return (
		<div id='main' className='h-screen flex overflow-hidden font-Inter'>
			<Alert
				message={isCorrectNetwork ? AlertMessage.NotConnected : AlertMessage.WrongNetwork}
				open={alertOpen}
				setOpen={setAlertOpen}
				onClick={changeNetworkAsync}
			/>
			<Modal
				open={buyModalOpen}
				setOpen={setBuyModalOpen}
				content={
					<BuyForm
						contracts={contracts}
						contractId={contractId}
						userAccount={userAccount}
						cloneFactoryContract={cloneFactoryContract}
						web3={web3}
						lumerinbalance={lumerinBalance}
						setOpen={setBuyModalOpen}
					/>
				}
			/>
			<Modal
				open={createModalOpen}
				setOpen={setCreateModalOpen}
				content={
					<CreateForm userAccount={userAccount} cloneFactoryContract={cloneFactoryContract} web3={web3} setOpen={setCreateModalOpen} />
				}
			/>
			<Modal
				open={sellerEditModalOpen}
				setOpen={setSellerEditModalOpen}
				content={
					<SellerEditForm
						contracts={contracts}
						contractId={contractId}
						userAccount={userAccount}
						web3={web3}
						setOpen={setSellerEditModalOpen}
					/>
				}
			/>
			<Modal
				open={buyerEditModalOpen}
				setOpen={setBuyerEditModalOpen}
				content={
					<BuyerEditForm
						contracts={contracts}
						contractId={contractId}
						userAccount={userAccount}
						web3={web3}
						setOpen={setBuyerEditModalOpen}
					/>
				}
			/>
			<Modal
				open={cancelModalOpen}
				setOpen={setCancelModalOpen}
				content={
					<CancelForm contracts={contracts} contractId={contractId} userAccount={userAccount} web3={web3} setOpen={setCancelModalOpen} />
				}
			/>
			<Modal
				open={claimLmrModalOpen}
				setOpen={setClaimLmrModalOpen}
				content={
					<ClaimLmrForm
						contracts={contracts}
						contractId={contractId}
						userAccount={userAccount}
						web3={web3}
						currentBlockTimestamp={currentBlockTimestamp}
						setOpen={setClaimLmrModalOpen}
					/>
				}
			/>
			{/* collapsable sidebar: below lg breakpoint */}
			<Transition.Root show={sidebarOpen} as={Fragment}>
				<Dialog as='div' static className='fixed inset-0 flex z-40 lg:hidden' open={sidebarOpen} onClose={setSidebarOpen}>
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
								</nav>
							</div>
						</div>
					</Transition.Child>
					<div className='flex-shrink-0 w-14' aria-hidden='true'>
						{/* Dummy element to force sidebar to shrink to fit close icon */}
					</div>
				</Dialog>
			</Transition.Root>
			<div className={contracts.length === 0 ? 'm-8 hidden xl:block' : 'hidden'}>
				<LogoIcon />
			</div>

			{/* Static sidebar for desktop */}
			<div className={contracts.length === 0 ? 'hidden' : 'hidden bg-white lg:flex lg:flex-shrink-0'}>
				<div className='flex flex-col w-64'>
					<div className='flex flex-col pt-4 pb-4 overflow-y-auto'>
						<div className='flex-1 flex flex-col ml-4 mb-16'>
							{/* <LogoIcon2 /> is identical but has different pattern id so it's not
                            hidden when <LogoIcon /> is hidden since they have the same pattern */}
							<LogoIcon2 />
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
							</nav>
						</div>
					</div>
				</div>
			</div>
			<div className='flex flex-col w-0 flex-1 overflow-hidden bg-white'>
				<div className={walletText === WalletText.ConnectViaMetaMask ? 'hidden' : 'relative z-10 flex-shrink-0 flex h-20 bg-white'}>
					<button
						type='button'
						className='px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 lg:hidden'
						onClick={() => setSidebarOpen(true)}
					>
						<span className='sr-only'>Open sidebar</span>
						<MenuAlt2Icon className='h-6 w-6' aria-hidden='true' />
					</button>
					<div className={walletText === WalletText.ConnectViaMetaMask ? 'hidden' : 'flex items-center ml-1 md:ml-4 xl:ml-0'}>
						<p className={classNames(pathName === PathName.MyContracts ? 'hidden xl:block' : '', 'text-lg font-semibold')}>
							{getPageTitle()}
						</p>
						<div
							className='text-black flex items-center px-2 text-xs md:text-sm font-medium rounded-md cursor-pointer'
							onClick={() => {
								setCreateModalOpen(true);
								setSidebarOpen(false);
							}}
						>
							<button
								className={
									pathName === PathName.MyContracts
										? 'w-28 h-8 md:w-48 md:h-12 ml-0 xl:ml-8 font-semibold text-lumerin-aqua border border-lumerin-aqua rounded-5'
										: 'hidden'
								}
							>
								Create Contract
							</button>
						</div>
					</div>
					<div className={buttonDisplay}>
						<div className='flex'>
							<div className='flex items-center'>
								<LumerinIcon />
							</div>
							<button className='btn-lmr pl-0 pointer-events-none'>
								<span className='ml-2 text-xs md:text-sm'>
									{lumerinBalance.toLocaleString('en-US', { maximumFractionDigits: 8 })} LMR
								</span>
							</button>
						</div>
						{walletText === WalletText.Disconnect ? (
							<div className='flex'>
								<button className='btn-add-lmr p-0 mr-4' onClick={() => addLumerinTokenToMetaMaskAsync()}>
									<span>Add LMR to Wallet</span>
								</button>
								<button className='btn-connected w-64 cursor-default'>
									<span className='mr-4'>{getTruncatedWalletAddress()}</span>
									<MetaMaskIcon />
								</button>
							</div>
						) : null}
					</div>
				</div>
				<div
					className={
						pathName === PathName.Marketplace && isAvailableContract ? 'mt-8 flex flex-col items-center text-sm sm:text-18' : 'hidden'
					}
				>
					<p>Welcome to the Lumerin Hashrate marketplace.</p>
					<p> Tap buy to purchase any of the contracts below.</p>
				</div>
				<main className='mt-10 ml-4 xl:ml-0 mr-4 flex-1 relative overflow-y-auto focus:outline-none'>{getContent()}</main>
			</div>
		</div>
	);
};

Main.displayName = 'Main';
Main.whyDidYouRender = false;
