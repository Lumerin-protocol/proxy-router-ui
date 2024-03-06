import { CloseOutType } from '../types';
import { Client, erc20Abi } from 'viem';
import { getBlock, readContract, waitForTransactionReceipt, writeContract } from 'viem/actions';
import { CloneFactoryAbi } from '../contracts/clonefactory';
import { ImplementationAbi } from '../contracts/implementation';

interface SendStatus {
	status: boolean;
	transactionHash: string;
}

export class EthereumGateway {
	private cloneFactoryAddr: string;
	private client: Client; // public node
	private lumerinAddr: string | null = null;
	private fee: bigint | null = null;

	constructor(web3Public: Client, cloneFactoryAddr: string) {
		this.cloneFactoryAddr = cloneFactoryAddr;
		this.client = web3Public;
	}

	async init() {
		this.lumerinAddr = await this.getLumerinAddr();
		this.fee = await this.getFee();
		console.log('web3 gateway initialized');
	}

	async getLumerinAddr(): Promise<string> {
		console.log('getting lumerin address', this.cloneFactoryAddr);
		return readContract(this.client, {
			abi: CloneFactoryAbi,
			functionName: 'baseImplementation',
			address: this.cloneFactoryAddr as `0x${string}`,
			args: [],
		});
	}

	async getFee(): Promise<bigint> {
		return readContract(this.client, {
			abi: CloneFactoryAbi,
			functionName: 'marketplaceFee',
			address: this.cloneFactoryAddr as `0x${string}`,
			args: [],
		});
	}

	getMarketplaceFee(): bigint {
		console.log('getting fee', this.fee);
		console.log('lumerin address', this.lumerinAddr);
		if (this.fee === null) {
			throw new Error('Web3 Gateway is not initialized');
		}
		return this.fee;
	}

	async getCurrentBlockTimestamp(): Promise<bigint> {
		const block = await getBlock(this.client, { blockTag: 'latest' });
		return block.timestamp;
	}

	async getLumerinBalance(address: string): Promise<bigint> {
		return readContract(this.client, {
			abi: erc20Abi,
			functionName: 'balanceOf',
			address: this.lumerinAddr as `0x${string}`,
			args: [address as `0x${string}`],
		});
	}

	async getContractPublicKey(address: string): Promise<string> {
		return readContract(this.client, {
			abi: ImplementationAbi,
			functionName: 'pubKey',
			address: address as `0x${string}`,
			args: [],
		});
	}

	async createContract(props: {
		price: string;
		speed: string;
		durationSeconds: number;
		pubKey: string;
		from: string;
	}): Promise<SendStatus> {
		const txHash = await writeContract(this.client, {
			abi: CloneFactoryAbi,
			functionName: 'setCreateNewRentalContractV2',
			address: this.cloneFactoryAddr as `0x${string}`,
			account: props.from as `0x${string}`,
			chain: this.client.chain,
			args: [
				BigInt(props.price),
				BigInt('0'),
				BigInt(props.speed),
				BigInt(props.durationSeconds),
				0,
				'0x0',
				props.pubKey,
			],
			value: this.getMarketplaceFee(),
		});

		const receipt = await waitForTransactionReceipt(this.client, { hash: txHash });
		return { status: receipt.status === 'success', transactionHash: txHash };
	}

	async closeContract(props: {
		contractAddress: string;
		from: string;
		fee: bigint;
		closeoutType: CloseOutType;
	}): Promise<SendStatus> {
		const txHash = await writeContract(this.client, {
			abi: ImplementationAbi,
			functionName: 'setContractCloseOut',
			address: props.contractAddress as `0x${string}`,
			account: props.from as `0x${string}`,
			args: [BigInt(props.closeoutType)],
			chain: this.client.chain,
			value: props.fee,
		});

		const receipt = await waitForTransactionReceipt(this.client, { hash: txHash });
		return { status: receipt.status === 'success', transactionHash: txHash };
	}

	async editContractDestination(props: {
		contractAddress: string;
		from: string;
		encrValidatorURL: string;
		encrDestURL: string;
	}): Promise<SendStatus> {
		const txHash = await writeContract(this.client, {
			abi: ImplementationAbi,
			functionName: 'setDestination',
			address: props.contractAddress as `0x${string}`,
			account: props.from as `0x${string}`,
			args: [props.encrValidatorURL, props.encrDestURL],
			chain: this.client.chain,
		});

		const receipt = await waitForTransactionReceipt(this.client, { hash: txHash });
		return { status: receipt.status === 'success', transactionHash: txHash };
	}

	async editContractTerms(props: {
		contractAddress: string;
		from: string;
		price: string;
		speed: string;
		length: string;
		profitTarget: string;
	}): Promise<SendStatus> {
		const txHash = await writeContract(this.client, {
			abi: ImplementationAbi,
			functionName: 'setUpdatePurchaseInformation',
			address: props.contractAddress as `0x${string}`,
			account: props.from as `0x${string}`,
			args: [
				BigInt(props.price),
				BigInt('0'),
				BigInt(props.speed),
				BigInt(props.length),
				Number(props.profitTarget),
			],
			chain: this.client.chain,
		});

		const receipt = await waitForTransactionReceipt(this.client, { hash: txHash });

		return { status: receipt.status === 'success', transactionHash: receipt.transactionHash };
	}
}
