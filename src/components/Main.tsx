/* eslint-disable react-hooks/exhaustive-deps */
import React, { Suspense, useEffect, useState, useMemo } from 'react';
import { Route, RouteComponentProps, Switch } from 'react-router-dom';
import MetaMaskOnboarding from '@metamask/onboarding';
import styled from '@emotion/styled';
import { Box } from '@mui/material';
import { uniqBy } from 'lodash';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import { Contract } from 'web3-eth-contract';
import { provider } from 'web3-core';

import { Marketplace } from './Marketplace';
import { MyOrders } from './MyOrders';
import { MyContracts } from './MyContracts';
import { Hero } from './Hero';
import { ResponsiveNavigation } from './Navigation/Navigation';
import { Spinner } from './ui/Spinner.styled';
import { SwitchNetworkAlert } from './ui/SwitchNetworkAlert';
import { ModalItem } from './ui/Modal';
import { Header } from './ui/Header';
import { BuyForm } from './ui/Forms/BuyerForms/BuyForm';
import { CreateForm } from './ui/Forms/SellerForms/CreateForm';
import { EditForm as SellerEditForm } from './ui/Forms/SellerForms/EditForm';
import { EditForm as BuyerEditForm } from './ui/Forms/BuyerForms/EditForm';
import { CancelForm } from './ui/Forms/BuyerForms/CancelForm';
import { ClaimLmrForm } from './ui/Forms/SellerForms/ClaimLmrForm';
import { ConnectButtonsWrapper } from './ui/Forms/FormButtons/Buttons.styled';

import { ImplementationContract } from 'contracts-js';
import { useInterval } from './hooks/useInterval';
import {
	addLumerinTokenToMetaMaskAsync,
	disconnectWalletConnectAsync,
	getLumerinTokenBalanceAsync,
	getWeb3ResultAsync,
	reconnectWalletAsync,
} from '../web3/helpers';
import { buttonClickHandler, truncateAddress, printError } from '../utils';
import {
	AddressLength,
	AlertMessage,
	Ethereum,
	HashRentalContract,
	PathName,
	WalletText,
	ConnectInfo,
	CurrentTab,
} from '../types';

import { MetaMaskIcon, WalletConnectIcon } from '../images/index';
import BubbleGraphic1 from '../images/Bubble_1.png';
import BubbleGraphic2 from '../images/Bubble_2.png';
import BubbleGraphic3 from '../images/Bubble_3.png';
import BubbleGraphic4 from '../images/Bubble_4.png';
import Bg from '../images/bg.png';

// Main contains the basic layout of pages and maintains contract state needed by its children
export const Main: React.FC = () => {
	// State and constants
	// TODO: as webapp grows think of using context
	const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
	const [isConnected, setIsConnected] = useState<boolean>(false);
	const [web3, setWeb3] = useState<Web3>();
	const [web3ReadOnly, setWeb3ReadOnly] = useState<Web3>();
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
	const [activeOrdersTab, setActiveOrdersTab] = useState<string>(CurrentTab.Running);

	const [chainId, setChainId] = useState<number>(0);
	const [isMetaMask, setIsMetaMask] = useState<boolean>(false);
	const [pathName, setPathname] = useState<string>('/');

	const userAccount = useMemo(() => {
		console.log('updating user account value: ', accounts && accounts[0] ? accounts[0] : '');
		return accounts && accounts[0] ? accounts[0] : '';
	}, [accounts]);
	const ethereum = window.ethereum as any;
	const isCorrectNetwork = chainId === parseInt(process.env.REACT_APP_CHAIN_ID!);

	const [width, setWidth] = useState<number>(window.innerWidth);

	function handleWindowSizeChange() {
		setWidth(window.innerWidth);
	}

	useEffect(() => {
		window.addEventListener('resize', handleWindowSizeChange);
		return () => {
			window.removeEventListener('resize', handleWindowSizeChange);
		};
	}, []);

	const isMobile = width <= 768;

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

		const handleOnConnect = (connectInfo: ConnectInfo): void => {
			console.log(`on connect, chain ID: ${connectInfo.chainId}`);
			setIsConnected(false);
		};

		const handleOnDisconnect: (error: Error) => void = (error) => {
			console.log(`on disconnect: ${error.message}`);
			setIsConnected(false);
			if (walletName === WalletText.ConnectViaMetaMask) {
				reconnectWalletAsync();
			}
		};

		// chainChanged
		const handleChainChanged = (chainId: string, pr: provider): void => {
			console.log(`on chain changed: ${chainId}`);
			if (walletName === WalletText.ConnectViaWalletConnect) {
				new Web3(pr).eth.net.getId().then((chainID) => {
					if (chainID !== parseInt(process.env.REACT_APP_CHAIN_ID!)) {
						disconnectWalletConnectAsync(false, web3, setIsConnected);
						setAlertOpen(true);
						return;
					}
				});
			}
			window.location.reload();
		};

		// accountsChanged
		const handleAccountsChanged: (accounts: string[]) => void = (accounts) => {
			console.log('on accounts changed');
			if (accounts.length === 0 || accounts[0] === '') {
				console.log('missed accounts');
			} else {
				setAccounts(accounts);
			}
		};

		const web3Result = await getWeb3ResultAsync(
			handleOnConnect,
			handleOnDisconnect,
			handleChainChanged,
			handleAccountsChanged,
			walletName,
		);

		if (!web3Result) {
			console.error('Missing web3 instance');
			return;
		}

		const { accounts, contractInstance, web3, web3ReadOnly } = web3Result;

		if (accounts.length === 0 || accounts[0] === '') {
			setAlertOpen(true);
		}

		const chainId = await web3.eth.net.getId();
		console.log('CHAIN ID', chainId);

		if (chainId !== parseInt(process.env.REACT_APP_CHAIN_ID!)) {
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
		setWeb3ReadOnly(web3ReadOnly);
		setIsConnected(true);
		localStorage.setItem('walletName', walletName);
		localStorage.setItem('isConnected', 'true');
		setChainId(chainId);
		localStorage.setItem('walletName', walletName);
		refreshContracts();
		if (walletName === WalletText.ConnectViaMetaMask) {
			setIsMetaMask(true);
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
	const getCurrentBlockTimestampAsync: () => Promise<number> = async () => {
		const currentBlockTimestamp = (await web3?.eth.getBlock('latest'))?.timestamp;
		return currentBlockTimestamp as number;
	};

	useInterval(() => {
		refreshContracts(false, undefined, true);
	}, 60 * 1000);

	const refreshContracts = (
		ignoreCheck: boolean | any = false,
		contractId?: string,
		updateByChunks = false
	) => {
		getCurrentBlockTimestampAsync().then((currentBlockTimestamp) => {
			if ((isCorrectNetwork && !anyModalOpen) || ignoreCheck) {
				setCurrentBlockTimestamp(currentBlockTimestamp as number);
				createContractsAsync(contractId, updateByChunks);
			}
		});
	};

	// Contracts setup
	const createContractAsync = async (
		address: string,
		usePrivateNode = false
	): Promise<HashRentalContract | null> => {
		try {
			const w3 = usePrivateNode && !!web3ReadOnly ? web3ReadOnly : web3;
			if (w3) {
				const implementationContractInstance = new w3.eth.Contract(
					ImplementationContract.abi as AbiItem[],
					address
				);
				const {
					_state: state,
					_price: price,
					_isDeleted: isDeleted,
					_speed: speed,
					_length: length,
					_startingBlockTimestamp: timestamp,
					_buyer: buyer,
					_seller: seller,
					_encryptedPoolData: encryptedPoolData,
					_version: version,
				} = await implementationContractInstance.methods.getPublicVariables().call();

				let buyerHistory = [];
				if (localStorage.getItem(address)) {
					const history = await implementationContractInstance.methods.getHistory('0', '100').call();
					buyerHistory = history
						.filter((h: any) => {
							return h[6] === userAccount;
						})
						.map((h: any) => ({
							...h,
							id: address,
						}));
				}

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
					version,
					isDeleted,
					history: buyerHistory,
				} as HashRentalContract;
			}

			return null;
		} catch (err) {
			console.log("🚀 ~ err:", err)
			if (!usePrivateNode) {
				return createContractAsync(address, true);
			} else {
				throw err;
			}
		}
	};

	const addContractsAsync = async (addresses: string[], updateByChunks = false) => {
		const chunkSize = updateByChunks ? 10 : addresses.length;
		let newContracts = [];
		for (let i = 0; i < addresses.length; i += chunkSize) {
			const chunk = addresses.slice(i, i + chunkSize);
			const hashRentalContracts = (
				await Promise.all(chunk.map(async (address) => await createContractAsync(address)))
			).filter((c: any) => !c?.isDeleted);
			newContracts.push(...hashRentalContracts);
		}
		const result = uniqBy([...newContracts, ...contracts], 'id');
		setContracts(result as HashRentalContract[]);
	};

	const createContractsAsync = async (
		contractId?: string,
		updateByChunks = false
	): Promise<void> => {
		try {
			console.log('Fetching contract list...');

			if (!cloneFactoryContract) return;

			const addresses: string[] = contractId
				? [contractId]
				: await cloneFactoryContract?.methods
					.getContractList()
					.call()
					.catch((error: any) => {
						console.log(
							'Error when trying get list of contract addresses from CloneFactory contract: ',
							error
						);
					});
			console.log('addresses: ', addresses, !!addresses);

			if (addresses) {
				console.log('adding contracts...');
				addContractsAsync(addresses, updateByChunks);
			}
		} catch (error) {
			const typedError = error as Error;
			printError(typedError.message, typedError.stack as string);
			// crash app if can't communicate with webfacing contract
			throw typedError;
		}
	};

	// Get Lumerin token balance
	const updateLumerinTokenBalanceAsync = async (): Promise<void> => {
		if (web3) {
			const lumerinTokenBalance = await getLumerinTokenBalanceAsync(web3, userAccount);
			if (lumerinTokenBalance) setLumerinBalance(lumerinTokenBalance);
		}
	};

	// Set contracts and orders once cloneFactoryContract exists
	useEffect(() => {
		if (cloneFactoryContract && accounts) {
			console.log('cloneFactoryContract:', cloneFactoryContract);
			console.log('accounts: ', accounts);
			if (isCorrectNetwork) {
				refreshContracts();
			}
		}
	}, [cloneFactoryContract, accounts]);

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
			refreshContracts(true, contractId);
			setContractId('');
			updateLumerinTokenBalanceAsync().catch((error) => {
				const typedError = error as Error;
				printError(typedError.message, typedError.stack as string)
			});
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

	useEffect(() => {
		if (isCorrectNetwork) {
			refreshContracts();
			updateLumerinTokenBalanceAsync();
		}
	}, [accounts, chainId]);

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
			{/* <button type='button' onClick={() => connectWallet(WalletText.ConnectViaWalletConnect)}>
				<span>{WalletText.ConnectViaWalletConnect}</span>
				<WalletConnectIcon />
			</button> */}
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
							refreshContracts={refreshContracts}
							editClickHandler={(event) =>
								buttonClickHandler(event, buyerEditModalOpen, setBuyerEditModalOpen)
							}
							cancelClickHandler={(event) =>
								buttonClickHandler(event, cancelModalOpen, setCancelModalOpen)
							}
							isMobile={isMobile}
							activeOrdersTab={activeOrdersTab}
							setActiveOrdersTab={setActiveOrdersTab}
						/>
					)}
				/>
				{/* <Route
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
				/> */}
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
							isMobile={isMobile}
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
			params: [{ chainId: web3?.utils.toHex(process.env.REACT_APP_CHAIN_ID!) }],
		});
		setAlertOpen(false);
		connectWallet(WalletText.ConnectViaMetaMask);
	};

	const BodyWrapper = styled.div`
		display: flex;
		min-height: 100vh;
		background: #eaf7fc;
		background-image: url(${Bg});
		background-size: 100% 100%;
		background-attachment: fixed;
	`;

	const drawerWidth = 240;

	return isConnected ? (
		<BodyWrapper>
			<SwitchNetworkAlert
				message={getAlertMessage()}
				open={alertOpen}
				setOpen={setAlertOpen}
				onClick={isMetaMask ? changeNetworkAsync : () => { }}
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
						cloneFactoryContract={cloneFactoryContract}
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
					isMobile={isMobile}
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
