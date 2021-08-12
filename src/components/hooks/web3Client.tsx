// import { useState } from 'react';
import getWeb3 from '../../getWeb3';
import TestToken from '../../contracts/TestToken.json';

export const web3Client = async () => {
	try {
		// Get network provider and web3 instance.
		const web3 = await getWeb3();
		// Use web3 to get the user's accounts.
		const accounts = await web3.eth.getAccounts();
		// Get the contract instance.
		const networkId = await web3.eth.net.getId();
		const deployedNetwork = (TestToken as any).networks[networkId];
		const instance = new web3.eth.Contract(TestToken.abi, deployedNetwork && deployedNetwork.address);
		// Set web3, accounts, and contract to the state, and then proceed with an
		// example of interacting with the contract's methods.
		// const [someState, setSomeState] = useState<someType>();
	} catch (error) {
		// Catch any errors for any of the above operations.
		alert(`Failed to load web3, accounts, or contract. Check console for details.`);
		console.error(error);
	}
};
