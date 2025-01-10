/* eslint-disable react-hooks/exhaustive-deps */
import React, { Suspense, useEffect, useState, useMemo } from 'react';
import { Route, RouteComponentProps, Switch } from 'react-router-dom';
import MetaMaskOnboarding from '@metamask/onboarding';
import styled from '@emotion/styled';
import { Box } from '@mui/material';
import Web3 from 'web3';
import { provider } from 'web3-core';

import { Marketplace } from './Marketplace';
import { MyOrders } from './MyOrders';
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

import { useInterval } from './hooks/useInterval';
import {
	LMRDecimalToLMR,
	ETHDecimalToETH,
	addLumerinTokenToMetaMaskAsync,
	disconnectWalletConnectAsync,
	getWeb3ResultAsync,
	intToHex,
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
	Validator,
} from '../types';

import { MetaMaskIcon, WalletConnectIcon } from '../images/index';
import BubbleGraphic1 from '../images/Bubble_1.png';
import BubbleGraphic2 from '../images/Bubble_2.png';
import BubbleGraphic3 from '../images/Bubble_3.png';
import BubbleGraphic4 from '../images/Bubble_4.png';
import Bg from '../images/bg.png';
import { EthereumGateway } from '../gateway/ethereum';
import { HistoryentryResponse } from 'contracts-js/dist/generated-types/Implementation';
import { getRate } from '../rates/rate';
import { Rates } from '../rates/interfaces';
import { ValidatorRegistry } from '../gateway/validator';

// Main contains the basic layout of pages and maintains contract state needed by its children
export const Main: React.FC = () => {
	// State and constants
	// TODO: as webapp grows think of using context
	const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
	const [isConnected, setIsConnected] = useState<boolean>(false);
	const [web3Gateway, setWeb3Gateway] = useState<EthereumGateway>();
	const [validatorRegistry, setValidatorRegistry] = useState<ValidatorRegistry>();
	const [accounts, setAccounts] = useState<string[]>();
	const [validators, setValidators] = useState<Validator[]>([]);
	const [contracts, setContracts] = useState<HashRentalContract[]>([]);
	const [contractId, setContractId] = useState<string>('');
	const [currentBlockTimestamp, setCurrentBlockTimestamp] = useState<number>(0);
	const [lumerinBalance, setLumerinBalance] = useState<number>(0);
	const [ethBalance, setEthBalance] = useState<number>(0);
	const [rates, setRates] = useState<Rates | undefined>();

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
	const ethereum = window.ethereum as Ethereum;
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
			walletName
		);

		if (!web3Result) {
			console.error('Missing web3 instance');
			return;
		}

		const validatorAddress = process.env.REACT_APP_VALIDATOR_REGISTRY_ADDRESS;

		if (!validatorAddress) {
			console.error('Missing Validator Address Env');
			return;
		}

		const { accounts, web3, web3Gateway, web3ReadOnly } = web3Result;

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

		const validator = new ValidatorRegistry(web3ReadOnly, validatorAddress, chainId);
		setAccounts(accounts);
		setWeb3Gateway(web3Gateway);
		setValidatorRegistry(validator);
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

	useEffect(() => {
		(async () => {
			let offset = 0;
			let limit = 100;

			const validators = await validatorRegistry?.getValidators(offset, limit);
			setValidators(validators as any);
		})();
	}, [validatorRegistry]);

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

	useInterval(() => {
		refreshContracts(false, undefined, true);
	}, 30 * 1000);

	const refreshContracts = (
		ignoreCheck: boolean | any = false,
		contractId?: string,
		updateByChunks = false
	) => {
		if (!web3Gateway) {
			console.error('Missing web3 gateway instance');
			return;
		}
		if ((isCorrectNetwork && !anyModalOpen) || ignoreCheck) {
			setCurrentBlockTimestamp(Math.floor(new Date().getTime() / 1000));
			createContractsAsync();
		}
	};

	// Contracts setup
	const fetchContractsAsync = async (): Promise<HashRentalContract[] | null> => {
		if (!web3Gateway) {
			console.error('Missing web3Gateway instance');
			return null;
		}

		const data = await web3Gateway.getContractsV2(userAccount);

		return data.map((e) => {
			const { hasFutureTerms, futureTerms, state } = e;
			let { version, speed, length, price } = e;
			if (hasFutureTerms && futureTerms && state === '0') {
				speed = futureTerms.speed;
				length = futureTerms.length;
				price = futureTerms.price;
				version = futureTerms.version;
			}

			return {
				id: e.id,
				price,
				speed,
				length,
				buyer: e.buyer,
				seller: e.seller,
				timestamp: e.startingBlockTimestamp,
				state: e.state,
				encryptedPoolData: e.encrValidatorUrl,
				version,
				isDeleted: e.isDeleted,
				history: e.history.map((h) => {
					return {
						id: e.id,
						_goodCloseout: h.isGoodCloseout,
						_buyer: h.buyer,
						_endTime: h.endTime,
						_purchaseTime: h.purchaseTime,
						_price: h.price,
						_speed: h.speed,
						_length: h.length,
					};
				}),
			};
		});
	};

	const createContractsAsync = async (): Promise<void> => {
		try {
			const contracts = await fetchContractsAsync();
			if (contracts) {
				setContracts(contracts.filter((c) => !c.isDeleted));
			}
		} catch (error) {
			console.error('Error fetching contracts', error);
		}
	};

	// Get Lumerin token balance
	const updateLumerinTokenBalanceAsync = async (): Promise<void> => {
		if (!web3Gateway) {
			console.error('Missing web3 instance');
			return;
		}

		const balanceDecimal = await web3Gateway.getLumerinBalance(userAccount);
		const ethBalanceDecimal = await web3Gateway.getEthBalance(userAccount);

		setLumerinBalance(LMRDecimalToLMR(+balanceDecimal));
		setEthBalance(ETHDecimalToETH(+ethBalanceDecimal));

		const rates = await getRate();
		if (rates) {
			setRates(rates);
		}
	};

	// Set contracts and orders once cloneFactoryContract exists
	useEffect(() => {
		if (isCorrectNetwork) {
			refreshContracts();
		}
	}, [accounts, isCorrectNetwork]);

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
				printError(typedError.message, typedError.stack as string);
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
							userAccount={userAccount}
							isMetaMask={isMetaMask}
							lumerinBalance={lumerinBalance}
							ethBalance={ethBalance}
							rates={rates}
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
			params: [{ chainId: intToHex(process.env.REACT_APP_CHAIN_ID!) }],
		});
		setAlertOpen(false);
		connectWallet(WalletText.ConnectViaMetaMask);
	};

	const disconnectWallet = () => {
		if (isMetaMask) {
			reconnectWalletAsync();
			return;
		}
		setIsConnected(false);
		web3Gateway?.disconnect();
	};

	const BodyWrapper = styled.div`
		display: flex;
		min-height: 100vh;
		background: #1e1e1e;
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
						web3Gateway={web3Gateway}
						validators={validators}
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
						web3Gateway={web3Gateway}
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
						web3Gateway={web3Gateway}
						closeForm={() => setSellerEditModalOpen(false)}
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
						web3Gateway={web3Gateway}
						closeForm={() => setBuyerEditModalOpen(false)}
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
						web3Gateway={web3Gateway}
						closeForm={() => setCancelModalOpen(false)}
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
						web3Gateway={web3Gateway}
						currentBlockTimestamp={currentBlockTimestamp}
						closeForm={() => setClaimLmrModalOpen(false)}
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
					handleDisconnect={disconnectWallet}
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
