import Web3 from 'web3';
import {
	CloneFactory,
	CloneFactoryContext,
	IERC20,
	IERC20Context,
	Implementation,
} from 'contracts-js';
import { CloseOutType, ContractState } from '../types';
import { ethers } from 'ethers';
import { IndexerContractEntry } from './interfaces';
import { sortContractsList } from '../utils';

interface SendStatus {
	status: boolean;
	transactionHash: string;
}

export class EthereumGateway {
	private cloneFactoryAddr: string;
	private web3Pub: Web3; // public node
	private web3Prv: Web3; // private node readonly
	private cloneFactoryPub: CloneFactoryContext; // public clonefactory instance
	private cloneFactoryPrv: CloneFactoryContext; // private clonefactory instance
	private paymentToken: IERC20Context | null = null;
	private feeToken: IERC20Context | null = null;
	private contractIndexerUrl: string;
	private feeRate: number | null = null;

	constructor(
		web3Public: Web3,
		web3Private: Web3,
		cloneFactoryAddr: string,
		contractIndexerUrl: string
	) {
		this.cloneFactoryAddr = cloneFactoryAddr;
		this.contractIndexerUrl = contractIndexerUrl;
		this.web3Pub = web3Public;
		this.web3Prv = web3Private;
		this.cloneFactoryPub = CloneFactory(web3Public, cloneFactoryAddr);
		this.cloneFactoryPrv = CloneFactory(web3Private, cloneFactoryAddr);
	}

	async init() {
		const feeTokenAddr = await this._getFeeToken();
		const paymentTokenAddr = await this._getPaymentToken();
		this.feeRate = await this._getFeeRate();
		this.feeToken = IERC20(this.web3Pub, feeTokenAddr);
		this.paymentToken = IERC20(this.web3Pub, paymentTokenAddr);
		console.log('web3 gateway initialized');
	}

	async _getPaymentToken(): Promise<string> {
		return await callProviders(
			() => this.cloneFactoryPub.methods.paymentToken().call(),
			() => this.cloneFactoryPrv.methods.paymentToken().call()
		);
	}

	async _getFeeToken(): Promise<string> {
		return await callProviders(
			() => this.cloneFactoryPub.methods.feeToken().call(),
			() => this.cloneFactoryPrv.methods.feeToken().call()
		);
	}

	async _getFeeRate(): Promise<number> {
		const feeRateScaled = await callProviders(
			() => this.cloneFactoryPub.methods.validatorFeeRateScaled().call(),
			() => this.cloneFactoryPrv.methods.validatorFeeRateScaled().call()
		);
		const feeDecimals = await callProviders(
			() => this.cloneFactoryPub.methods.VALIDATOR_FEE_DECIMALS().call(),
			() => this.cloneFactoryPrv.methods.VALIDATOR_FEE_DECIMALS().call()
		);
		return Number(feeRateScaled) / Number(feeDecimals);
	}

	getPaymentToken() {
		if (!this.paymentToken) {
			throw new Error('Web3 Gateway is not initialized');
		}
		return this.paymentToken;
	}

	getFeeToken() {
		if (!this.feeToken) {
			throw new Error('Web3 Gateway is not initialized');
		}
		return this.feeToken;
	}

	async getCurrentBlockTimestamp(): Promise<number> {
		return await callProviders(
			() => this.web3Pub.eth.getBlock('latest').then((block) => Number(block.timestamp)),
			() => this.web3Prv.eth.getBlock('latest').then((block) => Number(block.timestamp))
		);
	}

	async getPaymentTokenBalance(address: string): Promise<string> {
		return this.getPaymentToken().methods.balanceOf(address).call();
	}

	async getFeeTokenBalance(address: string): Promise<string> {
		return this.getFeeToken().methods.balanceOf(address).call();
	}

	async createContract(props: {
		speed: string;
		durationSeconds: number;
		pubKey: string;
		profitTarget: string;
		from: string;
	}): Promise<SendStatus> {
		const esimate = await this.cloneFactoryPub.methods
			.setCreateNewRentalContractV2(
				'0',
				'0',
				props.speed,
				String(props.durationSeconds),
				props.profitTarget,
				'',
				props.pubKey
			)
			.estimateGas({ from: props.from, ...(await this.getGasConfig()) });

		const res = await this.cloneFactoryPub.methods
			.setCreateNewRentalContractV2(
				'0',
				'0',
				props.speed,
				String(props.durationSeconds),
				props.profitTarget,
				'',
				props.pubKey
			)
			.send({ from: props.from, gas: esimate, ...(await this.getGasConfig()) });

		return { status: res.status, transactionHash: res.transactionHash };
	}

	async purchaseContract(props: {
		contractAddress: string;
		validatorAddress: string;
		encrValidatorURL: string;
		encrDestURL: string;
		termsVersion: string;
		buyer: string;
	}): Promise<SendStatus> {
		const gas = await this.cloneFactoryPub.methods
			.setPurchaseRentalContractV2(
				props.contractAddress,
				props.validatorAddress,
				props.encrValidatorURL,
				props.encrDestURL,
				props.termsVersion
			)
			.estimateGas({ from: props.buyer, ...(await this.getGasConfig()) });

		const res = await this.cloneFactoryPub.methods
			.setPurchaseRentalContractV2(
				props.contractAddress,
				props.validatorAddress,
				props.encrValidatorURL,
				props.encrDestURL,
				props.termsVersion
			)
			.send({ from: props.buyer, gas, ...(await this.getGasConfig()) });

		return { status: res.status, transactionHash: res.transactionHash };
	}

	async closeContract(props: {
		contractAddress: string;
		from: string;
		fee: string;
		closeoutType: CloseOutType;
	}): Promise<SendStatus> {
		const impl = Implementation(this.web3Pub, props.contractAddress);
		const gas = await impl.methods.closeEarly(0).estimateGas({
			from: props.from,
			value: props.fee,
			...(await this.getGasConfig()),
		});

		const receipt = await impl.methods.closeEarly(0).send({
			from: props.from,
			value: props.fee,
			gas,
			...(await this.getGasConfig()),
		});

		return { status: receipt.status, transactionHash: receipt.transactionHash };
	}

	async getContractsV2(walletAddr: string): Promise<IndexerContractEntry[]> {
		try {
			const url = new URL('/api/contracts', this.contractIndexerUrl);
			url.searchParams.append('walletAddr', walletAddr);
			const data = await fetch(url);
			const json = (await data.json()) as IndexerContractEntry[];
			return sortContractsList(json, (c) => Number(c.stats.successCount), 'asc');
		} catch (e) {
			const err = new Error(`Error calling contract indexer: ${(e as Error)?.message}`, {
				cause: e,
			});
			console.error(err);
			throw err;
		}
	}

	// async getContract(contractAddress: string) {
	// 	const data = await callProviders(
	// 		() => Implementation(this.web3Pub, contractAddress).methods.getPublicVariablesV2().call(),
	// 		() => Implementation(this.web3Prv, contractAddress).methods.getPublicVariablesV2().call()
	// 	);

	// 	return {
	// 		id: contractAddress,
	// 		price: data._price,
	// 		speed: data._speed,
	// 		length: data._length,
	// 		buyer: data._buyer,
	// 		seller: data._seller,
	// 		timestamp: data._startingBlockTimestamp,
	// 		state: data._state,
	// 		encryptedPoolData: data._encryptedPoolData,
	// 		version: data._version,
	// 		isDeleted: data._isDeleted,
	// 	};
	// }

	async getContractPublicKey(contractAddress: string): Promise<string> {
		return callProviders(
			() => Implementation(this.web3Pub, contractAddress).methods.pubKey().call(),
			() => Implementation(this.web3Prv, contractAddress).methods.pubKey().call()
		);
	}

	async getContractState(contractAddress: string): Promise<ContractState> {
		const state = await callProviders(
			() => Implementation(this.web3Pub, contractAddress).methods.contractState().call(),
			() => Implementation(this.web3Prv, contractAddress).methods.contractState().call()
		);
		switch (state) {
			case '0':
				return ContractState.Available;
			case '1':
				return ContractState.Running;
			default:
				throw new Error('Invalid state');
		}
	}

	async approvePayment(price: string, from: string): Promise<SendStatus> {
		const gas = await this.getPaymentToken()
			.methods.approve(this.cloneFactoryAddr, price)
			.estimateGas({ from, ...(await this.getGasConfig()) });

		const res = await this.getPaymentToken()
			.methods.approve(this.cloneFactoryAddr, price)
			.send({ from, gas, ...(await this.getGasConfig()) });

		return { status: res.status, transactionHash: res.transactionHash };
	}

	async approveFee(price: string, from: string): Promise<SendStatus> {
		const gas = await this.getFeeToken()
			.methods.approve(this.cloneFactoryAddr, price)
			.estimateGas({ from, ...(await this.getGasConfig()) });

		const res = await this.getFeeToken()
			.methods.approve(this.cloneFactoryAddr, price)
			.send({ from, gas, ...(await this.getGasConfig()) });

		return { status: res.status, transactionHash: res.transactionHash };
	}

	async editContractDestination(props: {
		contractAddress: string;
		from: string;
		encrValidatorURL: string;
		encrDestURL: string;
	}): Promise<SendStatus> {
		const impl = Implementation(this.web3Pub, props.contractAddress);
		const gas = await impl.methods
			.setDestination(props.encrValidatorURL, props.encrDestURL)
			.estimateGas({ from: props.from, ...(await this.getGasConfig()) });

		const receipt = await impl.methods
			.setDestination(props.encrValidatorURL, props.encrDestURL)
			.send({
				from: props.from,
				gas: gas,
				...(await this.getGasConfig()),
			});

		return { status: receipt.status, transactionHash: receipt.transactionHash };
	}

	async editContractTerms(props: {
		contractAddress: string;
		from: string;
		// price: string;
		speed: string;
		length: string;
		profitTarget: string;
	}): Promise<SendStatus> {
		const impl = Implementation(this.web3Pub, props.contractAddress);
		const gas = await impl.methods
			.setUpdatePurchaseInformation(props.speed, props.length, props.profitTarget)
			.estimateGas({ from: props.from, ...(await this.getGasConfig()) });

		const receipt = await impl.methods
			.setUpdatePurchaseInformation(props.speed, props.length, props.profitTarget)
			.send({ from: props.from, gas, ...(await this.getGasConfig()) });

		return { status: receipt.status, transactionHash: receipt.transactionHash };
	}

	async getGasConfig() {
		const gasPrice = await callProviders(
			() => this.web3Pub.eth.getGasPrice(),
			() => this.web3Prv.eth.getGasPrice()
		);

		const chainId = process.env.REACT_APP_CHAIN_ID;
		if (chainId === '421614' || chainId === '42161') {
			const maxPriorityFeePerGas = ethers.utils.parseUnits('0', 'gwei');
			const maxFeePerGas = ethers.utils.parseUnits(gasPrice, 'wei');

			const extraGasBuffer = ethers.utils.parseUnits('0.01', 'gwei');
			return {
				maxPriorityFeePerGas,
				maxFeePerGas: maxFeePerGas.add(extraGasBuffer),
			};
		}
		return {};
	}

	async getEthBalance(address: string): Promise<string> {
		const balance = await callProviders(
			() => this.web3Pub.eth.getBalance(address),
			() => this.web3Prv.eth.getBalance(address)
		);
		return balance;
	}

	async disconnect() {
		const wrap = async (web3: Web3) => {
			(web3.eth.currentProvider as any)?.disconnect();
		};

		await callProviders(
			() => wrap(this.web3Pub),
			() => wrap(this.web3Prv)
		);
	}
}

// Used to wrap error handling and logging for calling public provider first and if it fails then private provider
const callProviders = async <T>(
	publicFn: () => Promise<T>,
	privateFn: () => Promise<T>
): Promise<T> => {
	try {
		return await publicFn();
	} catch (e) {
		console.error('Error calling public provider', e);
		try {
			return await privateFn();
		} catch (e) {
			console.error('Error calling private provider', e);
			throw new Error('Error calling public and private providers', { cause: e });
		}
	}
};
