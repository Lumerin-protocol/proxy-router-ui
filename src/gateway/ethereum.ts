import Web3 from 'web3';
import { CloneFactory, CloneFactoryContext, Implementation, Lumerin } from 'contracts-js';
import { CloseOutType } from '../types';

interface SendStatus {
	status: boolean;
}

export class EthereumGateway {
	private web3: Web3;
	private cloneFactory: CloneFactoryContext;

	constructor(web3: Web3, cloneFactoryAddr: string) {
		this.web3 = web3;
		this.cloneFactory = CloneFactory(web3, cloneFactoryAddr);
	}

	async getLumerinAddr(): Promise<string> {
		return this.cloneFactory.methods.lumerin().call();
	}

	async getLumerinBalance(lumerinAddr: string, address: string): Promise<string> {
		const lumerin = Lumerin(this.web3, lumerinAddr);
		return lumerin.methods.balanceOf(address).call();
	}

	async getMarketplaceFee(): Promise<string> {
		return await this.cloneFactory.methods.marketplaceFee().call();
	}

	async purchaseContract(props: {
		contractAddress: string;
		validatorAddress: string;
		encrValidatorURL: string;
		encrDestURL: string;
		termsVersion: string;
		buyer: string;
		price: string;
		ethValue: string;
	}): Promise<SendStatus> {
		const gas = await this.cloneFactory.methods
			.setPurchaseRentalContractV2(
				props.contractAddress,
				props.validatorAddress,
				props.encrValidatorURL,
				props.encrDestURL,
				props.termsVersion
			)
			.estimateGas({ from: props.buyer, value: props.ethValue });

		const res = await this.cloneFactory.methods
			.setPurchaseRentalContractV2(
				props.contractAddress,
				props.validatorAddress,
				props.encrValidatorURL,
				props.encrDestURL,
				props.termsVersion
			)
			.send({ from: props.buyer, value: props.ethValue, gas });

		return { status: res.status };
	}

	async closeContract(props: {
		contractAddress: string;
		from: string;
		fee: string;
		closeoutType: CloseOutType;
	}): Promise<SendStatus> {
		const impl = Implementation(this.web3, props.contractAddress);
		const gas = await impl.methods.setContractCloseOut(String(props.closeoutType)).estimateGas({
			from: props.from,
			value: props.fee,
		});

		const receipt = await impl.methods
			.setContractCloseOut(String(CloseOutType.BuyerOrValidatorCancel))
			.send({ from: props.from, value: props.fee, gas });

		return { status: receipt.status };
	}

	async getContract(contractAddress: string) {
		const data = await Implementation(this.web3, contractAddress)
			.methods.getPublicVariables()
			.call();

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
		};
	}

	async getContractPublicKey(contractAddress: string): Promise<string> {
		return Implementation(this.web3, contractAddress).methods.pubKey().call();
	}

	async editContractDestination(props: {
		contractAddress: string;
		from: string;
		encrValidatorURL: string;
		encrDestURL: string;
	}): Promise<SendStatus> {
		const impl = Implementation(this.web3, props.contractAddress);
		const gas = await impl.methods
			.setDestination(props.encrValidatorURL, props.encrDestURL)
			.estimateGas({ from: props.from });

		const receipt = await impl.methods
			.setDestination(props.encrValidatorURL, props.encrDestURL)
			.send({
				from: props.from,
				gas: gas,
			});

		return { status: receipt.status };
	}

	async editContractTerms(props: {
		contractAddress: string;
		from: string;
		price: string;
		speed: string;
		length: string;
		profitTarget: string;
		termsVersion: string;
	}): Promise<SendStatus> {
		const impl = Implementation(this.web3, props.contractAddress);
		const gas = await impl.methods
			.setUpdatePurchaseInformation(props.price, '0', props.speed, props.length, props.profitTarget)
			.estimateGas({ from: props.from });

		const receipt = await impl.methods
			.setUpdatePurchaseInformation(props.price, '0', props.speed, props.length, props.profitTarget)
			.send({ from: props.from, gas });

		return { status: receipt.status };
	}
}
