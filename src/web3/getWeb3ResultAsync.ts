// import { useState } from 'react';
import React from 'react';
import getWeb3Async from './getWeb3Async';
import { AbiItem } from 'web3-utils';
import { Contract } from 'web3-eth-contract';
import TestContract from '../contracts/TestingContract.json';

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
	contractInstance: Contract;
}

export const getWeb3ResultAsync: (
	setOpenAlert: React.Dispatch<React.SetStateAction<boolean>>,
	setWalletText: React.Dispatch<React.SetStateAction<string>>
) => Promise<Web3Result | null> = async (setOpenAlert, setWalletText) => {
	try {
		// Get network provider and web3 instance.
		const web3 = await getWeb3Async(setOpenAlert, setWalletText);
		// Use web3 to get the user's accounts.
		const accounts = await web3.eth.getAccounts();
		if (accounts.length === 0 || accounts[0] === '') {
			setOpenAlert(true);
		}
		// Get the contract instance.
		const networkId = 1630680607183;
		const deployedNetwork = (TestContract as ContractJson).networks[networkId];
		const contractInstance = new web3.eth.Contract(TestContract.abi as AbiItem[], deployedNetwork && deployedNetwork.address);
		return { accounts, contractInstance };
	} catch (error) {
		console.log((error as Error).message);
		return null;
	}
};
