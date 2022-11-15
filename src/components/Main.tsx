/* eslint-disable react-hooks/exhaustive-deps */
import { Suspense, useEffect, useState } from 'react';
import { Route, RouteComponentProps, Switch } from 'react-router-dom';
import { MetaMaskIcon, WalletConnectIcon } from '../images/index';
import BubbleGraphic1 from '../images/Bubble_1.png';
import BubbleGraphic2 from '../images/Bubble_2.png';
import BubbleGraphic3 from '../images/Bubble_3.png';
import BubbleGraphic4 from '../images/Bubble_4.png';
import ImplementationContract from '../contracts/Implementation.json';
import { AbiItem } from 'web3-utils';
import { ModalItem } from './ui/Modal';
import { Marketplace } from './Marketplace';
import { Contract } from 'web3-eth-contract';
import { BuyForm } from './ui/Forms/BuyerForms/BuyForm';
import { MyOrders } from './MyOrders';
import { MyContracts } from './MyContracts';
import { Spinner } from './ui/Spinner.styled';
import { useInterval } from './hooks/useInterval';
import {
	addLumerinTokenToMetaMaskAsync,
	disconnectWalletConnectAsync,
	getLumerinTokenBalanceAsync,
	getWeb3ResultAsync,
} from '../web3/helpers';
import { buttonClickHandler, truncateAddress } from '../utils';
import MetaMaskOnboarding from '@metamask/onboarding';
import Web3 from 'web3';
import { printError } from '../utils';
import { CreateForm } from './ui/Forms/SellerForms/CreateForm';
import {
	AddressLength,
	AlertMessage,
	Ethereum,
	HashRentalContract,
	PathName,
	WalletText,
} from '../types';
import { EditForm as SellerEditForm } from './ui/Forms/SellerForms/EditForm';
import { EditForm as BuyerEditForm } from './ui/Forms/BuyerForms/EditForm';
import { Hero } from './Hero';
import { CancelForm } from './ui/Forms/BuyerForms/CancelForm';
import { ClaimLmrForm } from './ui/Forms/SellerForms/ClaimLmrForm';
import _ from 'lodash';
import styled from '@emotion/styled';
import { ConnectButtonsWrapper } from './ui/Forms/FormButtons/Buttons.styled';
import { ResponsiveNavigation } from './Navigation/Navigation';
import { Box } from '@mui/material';
import { Header } from './ui/Header';
import { SwitchNetworkAlert } from './ui/SwitchNetworkAlert';

// Main contains the basic layout of pages and maintains contract state needed by its children
export const Main: React.FC = () => {
	// State and constants
	// TODO: as webapp grows think of using context
	const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
	const [isConnected, setIsConnected] = useState<boolean>(false);
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
	const [anyModalOpen, setAnyModalOpen] = useState<boolean>(false);
	const [chainId, setChainId] = useState<number>(0);
	const [isMetaMask, setIsMetaMask] = useState<boolean>(false);
	const [pathName, setPathname] = useState<string>('/');

	const userAccount = accounts && accounts[0] ? accounts[0] : '';
	const ethereum = window.ethereum as Ethereum;
	const isCorrectNetwork = chainId === 5;

	// Onboard metamask and set wallet text
	const onboarding = new MetaMaskOnboarding();
	const onboardMetaMask: () => void = () => {
		// Onboard metamask if not installed
		if (!MetaMaskOnboarding.isMetaMaskInstalled()) {
			onboarding.startOnboarding();
		} else {
			onboarding.stopOnboarding();
		}
	};
	const connectWallet: (walletName: string) => void = async (walletName) => {
		if (walletName === WalletText.ConnectViaMetaMask) onboardMetaMask();

		const web3Result = await getWeb3ResultAsync(
			setAlertOpen,
			setIsConnected,
			setAccounts,
			walletName
		);
		if (web3Result) {
			const { accounts, contractInstance, web3 } = web3Result;
			const chainId = await web3.eth.net.getId();
			if (chainId !== 5) {
				disconnectWalletConnectAsync(
					walletName === WalletText.ConnectViaMetaMask,
					web3,
					setIsConnected
				);
				setAlertOpen(true);
			}
			setAccounts(accounts);
			setCloneFactoryContract(contractInstance);
			setWeb3(web3);
			setIsConnected(true);
			localStorage.setItem('walletName', walletName);
			localStorage.setItem('isConnected', 'true');
			setChainId(chainId);
			localStorage.setItem('walletName', walletName);
			if (walletName === WalletText.ConnectViaMetaMask) setIsMetaMask(true);
		}
	};

	const getTruncatedWalletAddress: () => string | null = () => {
		if (userAccount) {
			return truncateAddress(userAccount, AddressLength.MEDIUM);
		}

		return null;
	};

	// When a user disconnects MetaMask, alertOpen will be true
	useEffect(() => {
		if (alertOpen) setIsConnected(false);
	}, [alertOpen]);

	// Attempt to reconnect wallet on page refresh
	useEffect(() => {
		const connectWalletOnPageLoad = async () => {
			if (localStorage?.getItem('walletName')) {
				try {
					connectWallet(localStorage.walletName);
				} catch (error) {
					console.log(error);
				}
			}
		};
		connectWalletOnPageLoad();
	}, []);

	// Get timestamp of current block
	const getCurrentBlockTimestampAsync: () => void = async () => {
		const currentBlockTimestamp = (await web3?.eth.getBlock('latest'))?.timestamp;
		setCurrentBlockTimestamp(currentBlockTimestamp as number);
	};

	useEffect(() => getCurrentBlockTimestampAsync(), [web3]);

	// Contracts setup
	const createContractAsync: (address: string) => Promise<HashRentalContract | null> = async (
		address
	) => {
		if (web3) {
			const implementationContractInstance = new web3.eth.Contract(
				ImplementationContract.abi as AbiItem[],
				address
			);
			const {
				0: state,
				1: price,
				// eslint-disable-next-line
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
		const hashRentalContracts = await Promise.all(
			addresses.map(async (address) => await createContractAsync(address))
		);

		// Update contracts if deep equality is false
		if (!_.isEqual(contracts, hashRentalContracts))
			setContracts(hashRentalContracts as HashRentalContract[]);
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

	// Set contracts and orders once cloneFactoryContract exists
	useEffect(() => {
		if (isCorrectNetwork) createContractsAsync();
	}, [cloneFactoryContract, accounts, web3]);

	// Check if any modals or alerts are open
	// TODO: Replace this with a better way to track all modal states
	useEffect(() => {
		if (
			alertOpen ||
			buyModalOpen ||
			sellerEditModalOpen ||
			buyerEditModalOpen ||
			cancelModalOpen ||
			createModalOpen ||
			claimLmrModalOpen
		) {
			setAnyModalOpen(true);
		} else {
			setAnyModalOpen(false);
		}
	}, [
		alertOpen,
		buyModalOpen,
		sellerEditModalOpen,
		buyerEditModalOpen,
		cancelModalOpen,
		createModalOpen,
		claimLmrModalOpen,
	]);

	// Get contracts at interval of 5 seconds
	// TODO: Replace this with something like web sockets
	useInterval(() => {
		if (isCorrectNetwork && !anyModalOpen) createContractsAsync();
	}, 5000);

	useEffect(() => {
		if (isCorrectNetwork) updateLumerinTokenBalanceAsync();
	}, [web3, accounts, chainId]);

	useEffect(() => {
		setPathname(window.location.pathname);
	}, [window.location.pathname]);

	// Content setup
	const ActionButtons: JSX.Element = (
		<ConnectButtonsWrapper>
			<button type='button' onClick={() => connectWallet(WalletText.ConnectViaMetaMask)}>
				<span>{WalletText.ConnectViaMetaMask}</span>
				<MetaMaskIcon />
			</button>
			<button type='button' onClick={() => connectWallet(WalletText.ConnectViaWalletConnect)}>
				<span>{WalletText.ConnectViaWalletConnect}</span>
				<WalletConnectIcon />
			</button>
		</ConnectButtonsWrapper>
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
							editClickHandler={(event) =>
								buttonClickHandler(event, buyerEditModalOpen, setBuyerEditModalOpen)
							}
							cancelClickHandler={(event) =>
								buttonClickHandler(event, cancelModalOpen, setCancelModalOpen)
							}
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
							editClickHandler={(event) =>
								buttonClickHandler(event, sellerEditModalOpen, setSellerEditModalOpen)
							}
							claimLmrClickHandler={(event) =>
								buttonClickHandler(event, claimLmrModalOpen, setClaimLmrModalOpen)
							}
							setCreateModalOpen={setCreateModalOpen}
							setSidebarOpen={setSidebarOpen}
						/>
					)}
				/>
				<Route
					path={PathName.Marketplace}
					render={(props: RouteComponentProps) => (
						<Marketplace
							{...props}
							web3={web3}
							userAccount={userAccount}
							isMetaMask={isMetaMask}
							lumerinBalance={lumerinBalance}
							contracts={contracts}
							setContractId={setContractId}
							currentBlockTimestamp={currentBlockTimestamp}
							buyClickHandler={(event) => buttonClickHandler(event, buyModalOpen, setBuyModalOpen)}
						/>
					)}
				/>
			</Switch>
		</Suspense>
	);

	const getContent: () => JSX.Element = () => {
		return routes;
	};

	const getPageTitle: () => string = () => {
		if (pathName === PathName.Marketplace) return 'Marketplace';
		if (pathName === PathName.MyOrders) return 'Buyer Hub';
		if (pathName === PathName.MyContracts) return 'Seller Hub';
		return '';
	};

	const getAlertMessage: () => string = () => {
		if (isCorrectNetwork && !isConnected) return AlertMessage.NotConnected;
		return isMetaMask ? AlertMessage.WrongNetworkMetaMask : AlertMessage.WrongNetworkWalletConnect;
	};

	const changeNetworkAsync: () => void = async () => {
		await ethereum.request({
			method: 'wallet_switchEthereumChain',
			params: [{ chainId: web3?.utils.toHex(5) }],
		});
		setAlertOpen(false);
		connectWallet(WalletText.ConnectViaMetaMask);
	};

	const BodyWrapper = styled.div`
		display: flex;
		min-height: 100vh;
		background: #eaf7fc;
		background-image: url(${BubbleGraphic1}), url(${BubbleGraphic2}), url(${BubbleGraphic3}),
			url(${BubbleGraphic4});
		background-position: bottom right, right top, left top, left bottom;
		background-repeat: no-repeat;
		background-size: 25% 15% 15% 10%;
	`;

	const drawerWidth = 240;

	return isConnected ? (
		<BodyWrapper>
			<SwitchNetworkAlert
				message={getAlertMessage()}
				open={alertOpen}
				setOpen={setAlertOpen}
				onClick={isMetaMask ? changeNetworkAsync : () => {}}
			/>
			<ModalItem
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
			<ModalItem
				open={createModalOpen}
				setOpen={setCreateModalOpen}
				content={
					<CreateForm
						userAccount={userAccount}
						cloneFactoryContract={cloneFactoryContract}
						web3={web3}
						setOpen={setCreateModalOpen}
					/>
				}
			/>
			<ModalItem
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
			<ModalItem
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
			<ModalItem
				open={cancelModalOpen}
				setOpen={setCancelModalOpen}
				content={
					<CancelForm
						contracts={contracts}
						contractId={contractId}
						userAccount={userAccount}
						web3={web3}
						setOpen={setCancelModalOpen}
					/>
				}
			/>
			<ModalItem
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
			<Box component='nav' sx={{ width: { md: drawerWidth }, flexShrink: { sm: 0 } }}>
				<ResponsiveNavigation
					sidebarOpen={sidebarOpen}
					setSidebarOpen={setSidebarOpen}
					setPathname={setPathname}
					pathName={pathName}
					drawerWidth={drawerWidth}
				/>
			</Box>
			<Box
				sx={{
					marginLeft: 'auto',
					flexGrow: 1,
					p: 3,
					width: { xs: `100%`, sm: `100%`, md: `calc(100% - ${drawerWidth}px)` },
					minHeight: '100vh',
				}}
			>
				<Header
					setSidebarOpen={setSidebarOpen}
					pageTitle={getPageTitle()}
					truncatedWalletAddress={getTruncatedWalletAddress()}
					addTokenToMetamask={addLumerinTokenToMetaMaskAsync}
					isMetamask={isMetaMask}
					drawerWidth={drawerWidth}
				/>
				<Box component='main'>
					<main>{getContent()}</main>
				</Box>
			</Box>
		</BodyWrapper>
	) : (
		<Hero actionButtons={ActionButtons} />
	);
};

Main.displayName = 'Main';
Main.whyDidYouRender = false;
