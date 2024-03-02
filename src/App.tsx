/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useMemo } from 'react';
import MetaMaskOnboarding from '@metamask/onboarding';
import { Box } from '@mui/material';
import { uniqBy } from 'lodash';
import Web3 from 'web3';
import { provider } from 'web3-core';
import { Hero } from './pages/Hero';
import { ResponsiveNavigation } from './components/navigation/Navigation';
import { SwitchNetworkAlert } from './components/ui/SwitchNetworkAlert';
import { Header } from './components/ui/Header';
import { useInterval } from './hooks/useInterval';
import {
	LMRDecimalToLMR,
	addLumerinTokenToMetaMaskAsync,
	disconnectWalletConnectAsync,
	getWeb3ResultAsync,
	intToHex,
	reconnectWalletAsync,
} from './web3/helpers';
import { printError } from './utils';
import {
	AlertMessage,
	Ethereum,
	HashRentalContract,
	WalletText,
	ConnectInfo,
	CurrentTab,
} from './types';

import { EthereumGateway } from './gateway/ethereum';
import { HistoryentryResponse } from 'contracts-js/dist/generated-types/Implementation';
import { Main } from './Main';
import ReactGA from 'react-ga4';

const trackingId = 'G-TN08K48RMS';
ReactGA.initialize(trackingId);

// Root contains the main state and logic for the app
export const App: React.FC = () => {
	const [isConnected, setIsConnected] = useState<boolean>(false);
	const [web3Gateway, setWeb3Gateway] = useState<EthereumGateway>();
	const [accounts, setAccounts] = useState<string[]>();
	const [contracts, setContracts] = useState<HashRentalContract[]>([]);
	const [contractId, setContractId] = useState<string>('');
	const [currentBlockTimestamp, setCurrentBlockTimestamp] = useState<number>(0);
	const [lumerinBalance, setLumerinBalance] = useState<number>(0);

	const [alertOpen, setAlertOpen] = useState<boolean>(false);
	const [anyModalOpen, setAnyModalOpen] = useState<boolean>(false);
	const [activeOrdersTab, setActiveOrdersTab] = useState<CurrentTab>(CurrentTab.Running);

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

		const { accounts, web3, web3Gateway } = web3Result;

		if (accounts.length === 0 || accounts[0] === '') {
			setAlertOpen(true);
		}

		const chainId = await web3.eth.net.getId();

		if (chainId !== parseInt(process.env.REACT_APP_CHAIN_ID!)) {
			disconnectWalletConnectAsync(
				walletName === WalletText.ConnectViaMetaMask,
				web3,
				setIsConnected
			);
			setAlertOpen(true);
		}
		setAccounts(accounts);
		setWeb3Gateway(web3Gateway);
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

	useInterval(() => {
		refreshContracts(false, undefined, true);
	}, 60 * 1000);

	const refreshContracts = (
		ignoreCheck: boolean | any = false,
		contractId?: string,
		updateByChunks = false
	) => {
		if (!web3Gateway) {
			console.error('Missing web3 gateway instance');
			return;
		}
		web3Gateway.getCurrentBlockTimestamp().then((currentBlockTimestamp) => {
			if ((isCorrectNetwork && !anyModalOpen) || ignoreCheck) {
				setCurrentBlockTimestamp(currentBlockTimestamp as number);
				fetchContracts(contractId, updateByChunks);
			}
		});
	};

	// Contracts setup
	const loadContract = async (address: string): Promise<HashRentalContract | null> => {
		if (!web3Gateway) {
			console.error('Missing web3Gateway instance');
			return null;
		}

		const data = await web3Gateway.getContract(address);

		let buyerHistory: (HistoryentryResponse & { id: string })[] = [];
		if (localStorage.getItem(address)) {
			const history = await web3Gateway.getContractHistory(address, 0, 100);
			buyerHistory = history
				.filter((entry) => entry._buyer === userAccount)
				.map((entry) => ({ ...entry, id: address }));
		}

		return {
			id: address,
			price: data.price,
			speed: data.speed,
			length: data.length,
			buyer: data.buyer,
			seller: data.seller,
			timestamp: data.timestamp,
			state: data.state,
			encryptedPoolData: data.encryptedPoolData,
			version: data.version,
			isDeleted: data.isDeleted,
			history: buyerHistory,
		};
	};

	const loadContracts = async (addresses: string[], updateByChunks = false) => {
		const chunkSize = updateByChunks ? 10 : addresses.length;
		let newContracts = [];
		for (let i = 0; i < addresses.length; i += chunkSize) {
			const chunk = addresses.slice(i, i + chunkSize);
			const hashRentalContracts = (
				await Promise.all(chunk.map(async (address) => await loadContract(address)))
			).filter((c: any) => !c?.isDeleted);
			newContracts.push(...hashRentalContracts);
		}
		const result = uniqBy([...newContracts, ...contracts], 'id');
		setContracts(result as HashRentalContract[]);
	};

	const fetchContracts = async (contractId?: string, updateByChunks = false): Promise<void> => {
		try {
			console.log('Fetching contract list...');

			if (!web3Gateway) {
				console.error('Missing web3 gateway instance');
				return;
			}

			let addresses: string[] = [];

			if (contractId) {
				addresses = [contractId];
			} else {
				try {
					addresses = await web3Gateway.getContracts();
				} catch (error) {
					console.log('Error when trying get list of contracts', error);
					return;
				}
			}

			console.log('contract addresses: ', addresses);
			loadContracts(addresses, updateByChunks);
		} catch (error) {
			const typedError = error as Error;
			printError(typedError.message, typedError.stack as string);
			// crash app if can't communicate with webfacing contract
			throw typedError;
		}
	};

	// Get Lumerin token balance
	const updateLumerinTokenBalanceAsync = async (): Promise<void> => {
		if (!web3Gateway) {
			console.error('Missing web3 instance');
			return;
		}

		const balanceDecimal = await web3Gateway.getLumerinBalance(userAccount);
		setLumerinBalance(LMRDecimalToLMR(balanceDecimal));
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
		if (alertOpen) {
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
	}, [alertOpen]);

	useEffect(() => {
		if (isCorrectNetwork) {
			refreshContracts();
			updateLumerinTokenBalanceAsync();
		}
	}, [accounts, chainId]);

	useEffect(() => {
		setPathname(window.location.pathname);
	}, [window.location.pathname]);

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

	return (
		<Main
			isConnected={isConnected}
			alertOpen={alertOpen}
			userAccount={userAccount}
			contracts={contracts}
			currentBlockTimestamp={currentBlockTimestamp}
			lumerinBalance={lumerinBalance}
			isMetamask={isMetaMask}
			isMobile={isMobile}
			activeOrdersTab={activeOrdersTab}
			setActiveOrdersTab={setActiveOrdersTab}
			setAlertOpen={setAlertOpen}
			getAlertMessage={getAlertMessage}
			pathName={pathName}
			setPathName={setPathname}
			connectWallet={connectWallet}
			changeNetworkAsync={changeNetworkAsync}
			addLumerinTokenToMetaMaskAsync={addLumerinTokenToMetaMaskAsync}
			refreshContracts={refreshContracts}
		/>
	);
};
