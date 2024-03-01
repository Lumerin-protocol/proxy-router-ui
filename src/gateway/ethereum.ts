import Web3 from 'web3';
import {
	CloneFactory,
	CloneFactoryContext,
	Implementation,
	Lumerin,
	LumerinContext,
} from 'contracts-js';
import { CloseOutType, ContractState } from '../types';
import { HistoryentryResponse } from 'contracts-js/dist/generated-types/Implementation';
import { ethers } from 'ethers';

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
	private lumerin: LumerinContext | null = null;
	private fee: string | null = null;

	constructor(web3Public: Web3, web3Private: Web3, cloneFactoryAddr: string) {
		this.cloneFactoryAddr = cloneFactoryAddr;
		this.web3Pub = web3Public;
		this.web3Prv = web3Private;
		this.cloneFactoryPub = CloneFactory(web3Public, cloneFactoryAddr);
		this.cloneFactoryPrv = CloneFactory(web3Private, cloneFactoryAddr);
	}

	async init() {
		const lumerinAddr = await this.getLumerinAddr();
		this.lumerin = Lumerin(this.web3Pub, lumerinAddr);
		this.fee = await this.getMarketplaceFeeAddr();
		console.log('web3 gateway initialized');
	}

	async getLumerinAddr(): Promise<string> {
		return await callProviders(
			() => this.cloneFactoryPub.methods.lumerin().call(),
			() => this.cloneFactoryPrv.methods.lumerin().call()
		);
	}

	async getMarketplaceFeeAddr(): Promise<string> {
		return await callProviders(
			() => this.cloneFactoryPub.methods.marketplaceFee().call(),
			() => this.cloneFactoryPrv.methods.marketplaceFee().call()
		);
	}

	getLumerin() {
		if (!this.lumerin) {
			throw new Error('Web3 Gateway is not initialized');
		}
		return this.lumerin;
	}

	getMarketplaceFee(): string {
		if (!this.fee) {
			throw new Error('Web3 Gateway is not initialized');
		}
		return this.fee;
	}

	async getCurrentBlockTimestamp(): Promise<number> {
		return await callProviders(
			() => this.web3Pub.eth.getBlock('latest').then((block) => Number(block.timestamp)),
			() => this.web3Prv.eth.getBlock('latest').then((block) => Number(block.timestamp))
		);
	}

	async getLumerinBalance(address: string): Promise<string> {
		return this.getLumerin().methods.balanceOf(address).call();
	}

	async createContract(props: {
		price: string;
		speed: string;
		durationSeconds: number;
		pubKey: string;
		from: string;
	}): Promise<SendStatus> {
		const esimate = await this.cloneFactoryPub.methods
			.setCreateNewRentalContractV2(
				props.price,
				'0',
				props.speed,
				String(props.durationSeconds),
				'0',
				'',
				props.pubKey
			)
			.estimateGas({ from: props.from, ...(await this.getGasConfig()) });

		const res = await this.cloneFactoryPub.methods
			.setCreateNewRentalContractV2(
				props.price,
				'0',
				props.speed,
				String(props.durationSeconds),
				'0',
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
		feeETH: string;
	}): Promise<SendStatus> {
		const gas = await this.cloneFactoryPub.methods
			.setPurchaseRentalContractV2(
				props.contractAddress,
				props.validatorAddress,
				props.encrValidatorURL,
				props.encrDestURL,
				props.termsVersion
			)
			.estimateGas({ from: props.buyer, value: props.feeETH });

		const res = await this.cloneFactoryPub.methods
			.setPurchaseRentalContractV2(
				props.contractAddress,
				props.validatorAddress,
				props.encrValidatorURL,
				props.encrDestURL,
				props.termsVersion
			)
			.send({ from: props.buyer, value: props.feeETH, gas });

		return { status: res.status, transactionHash: res.transactionHash };
	}

	async closeContract(props: {
		contractAddress: string;
		from: string;
		fee: string;
		closeoutType: CloseOutType;
	}): Promise<SendStatus> {
		const impl = Implementation(this.web3Pub, props.contractAddress);
		const gas = await impl.methods.setContractCloseOut(String(props.closeoutType)).estimateGas({
			from: props.from,
			value: props.fee,
			...(await this.getGasConfig()),
		});

		const receipt = await impl.methods
			.setContractCloseOut(String(CloseOutType.BuyerOrValidatorCancel))
			.send({
				from: props.from,
				value: props.fee,
				gas,
				...(await this.getGasConfig()),
			});

		return { status: receipt.status, transactionHash: receipt.transactionHash };
	}

	async getContracts() {
		return await callProviders(
			() => this.cloneFactoryPub.methods.getContractList().call(),
			() => this.cloneFactoryPrv.methods.getContractList().call()
		);
	}

	async getContract(contractAddress: string) {
		const data = await callProviders(
			() => Implementation(this.web3Pub, contractAddress).methods.getPublicVariables().call(),
			() => Implementation(this.web3Prv, contractAddress).methods.getPublicVariables().call()
		);

		return {
			id: contractAddress,
			price: data._price,
			speed: data._speed,
			length: data._length,
			buyer: data._buyer,
			seller: data._seller,
			timestamp: data._startingBlockTimestamp,
			state: data._state,
			encryptedPoolData: data._encryptedPoolData,
			version: data._version,
			isDeleted: data._isDeleted,
		};
	}

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

	async getContractHistory(
		contractAddress: string,
		offset = 0,
		limit = 100
	): Promise<HistoryentryResponse[]> {
		const history = await callProviders(
			() =>
				Implementation(this.web3Pub, contractAddress)
					.methods.getHistory(String(offset), String(limit))
					.call(),
			() =>
				Implementation(this.web3Prv, contractAddress)
					.methods.getHistory(String(offset), String(limit))
					.call()
		);
		return history;
	}

	async increaseAllowance(price: string, from: string): Promise<SendStatus> {
		const gas = await this.getLumerin()
			.methods.increaseAllowance(this.cloneFactoryAddr, price)
			.estimateGas({ from, ...(await this.getGasConfig()) });

		const res = await this.getLumerin()
			.methods.increaseAllowance(this.cloneFactoryAddr, price)
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
		price: string;
		speed: string;
		length: string;
		profitTarget: string;
	}): Promise<SendStatus> {
		const impl = Implementation(this.web3Pub, props.contractAddress);
		const gas = await impl.methods
			.setUpdatePurchaseInformation(props.price, '0', props.speed, props.length, props.profitTarget)
			.estimateGas({ from: props.from });

		const receipt = await impl.methods
			.setUpdatePurchaseInformation(props.price, '0', props.speed, props.length, props.profitTarget)
			.send({ from: props.from, gas });

		return { status: receipt.status, transactionHash: receipt.transactionHash };
	}

	async getGasConfig() {
		const gasPrice = await callProviders(
			() => this.web3Pub.eth.getGasPrice(),
			() => this.web3Prv.eth.getGasPrice()
		);

		const chainId = process.env.REACT_APP_CHAIN_ID;
		if (chainId === '421614' || chainId === '42161') {
			// no priority fee on Arbitrum, maxFeePerGas is stable at 0.1 gwei
			return {
				maxPriorityFeePerGas: ethers.utils.parseUnits('0', 'gwei'),
				maxFeePerGas: ethers.utils.parseUnits(gasPrice, 'wei'),
			};
		}
		return {};
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
