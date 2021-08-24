// import { useState } from 'react';
import getWeb3Async from './getWeb3Async';
import { AbiItem } from 'web3-utils';
import { Contract } from 'web3-eth-contract';
import TestToken from '../contracts/TestToken.json';
import Web3 from 'web3';

interface Networks {
	[networkId: number]: {
		address: string;
	};
}

interface ContractJson {
	networks: Networks;
}

interface Web3Result {
	accounts: string[];
	instance: Contract;
	web3: Web3;
}

export const getWeb3ResultAsync: (setOpenAlert: React.Dispatch<React.SetStateAction<boolean>>) => Promise<Web3Result | null> = async (
	setOpenAlert
) => {
	try {
		// Get network provider and web3 instance.
		const web3 = await getWeb3Async(setOpenAlert);
		// Use web3 to get the user's accounts.
		const accounts = await web3.eth.getAccounts();
		if (accounts.length === 0 || accounts[0] === '') {
			setOpenAlert(true);
		}
		// Get the contract instance.
		const networkId = await web3.eth.net.getId();
		const deployedNetwork = (TestToken as ContractJson).networks[networkId];
		const instance = new web3.eth.Contract(TestToken.abi as AbiItem[], deployedNetwork && deployedNetwork.address);

		return { accounts, instance, web3 };
	} catch (error) {
		setOpenAlert(true);
		return null;
	}
};
