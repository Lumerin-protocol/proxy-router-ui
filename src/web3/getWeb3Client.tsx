// import { useState } from 'react';
import getWeb3 from './getWeb3';
import TestToken from '../contracts/TestToken.json';

export const getWeb3Client: (
	setOpenAlert: React.Dispatch<React.SetStateAction<boolean>>
) => Promise<{ accounts: any; instance: any; web3: Promise<any> } | null> = async (setOpenAlert) => {
	try {
		// Get network provider and web3 instance.
		const web3 = await getWeb3();
		// Use web3 to get the user's accounts.
		const accounts = await web3.eth.getAccounts();
		// Get the contract instance.
		const networkId = await web3.eth.net.getId();
		const deployedNetwork = (TestToken as any).networks[networkId];
		const instance = new web3.eth.Contract(TestToken.abi, deployedNetwork && deployedNetwork.address);

		return { accounts, instance, web3 };
	} catch (error) {
		setOpenAlert(true);
		return null;
	}
};
