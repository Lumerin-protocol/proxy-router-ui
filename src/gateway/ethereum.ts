import Web3 from 'web3'
import { CloneFactory, CloneFactoryContext, Implementation, Lumerin, LumerinContext } from "contracts-js";
import { CloseOutType, ContractState } from "../types";
import { HistoryentryResponse } from 'contracts-js/dist/generated-types/Implementation';
import { ethers } from 'ethers';

interface SendStatus {
	status: boolean;
  transactionHash: string;
}

export class EthereumGateway {
  private web3: Web3;
  private cloneFactory: CloneFactoryContext;
  private lumerin: LumerinContext | null = null;
  private fee: string | null = null;

  constructor(web3: Web3, cloneFactoryAddr: string) {
    this.web3 = web3;
    this.cloneFactory = CloneFactory(web3, cloneFactoryAddr);
  }

  async init(){
    const lumerinAddr = await this.getLumerinAddr();
    this.lumerin = Lumerin(this.web3, lumerinAddr);
  }

	async getLumerinAddr(): Promise<string> {
		return this.cloneFactory.methods.lumerin().call();
	}

  getLumerin() {
    if (!this.lumerin) {
      throw new Error('Web3 Gateway is not initialized');
    }
    return this.lumerin;
  }

  getMarketplaceFee(): string {
    if (!this.fee){
      throw new Error('Web3 Gateway is not initialized');
    }
    return this.fee
  }

  async getCurrentBlockTimestamp(): Promise<number> {
    return this.web3.eth.getBlock('latest').then((block) => Number(block.timestamp));
  }

  async getLumerinBalance(address: string): Promise<string> {
    return this.getLumerin().methods.balanceOf(address).call();
  }

  async createContract(props: {price: string, speed: string, durationSeconds: number, pubKey: string, from: string}): Promise<SendStatus> {
    const esimate = await this.cloneFactory.methods.setCreateNewRentalContractV2(
      props.price,
      '0',
      props.speed,
      String(props.durationSeconds),
      "0",
      "",
      props.pubKey,
    ).estimateGas({ from: props.from, ...this.getGasConfig() });
    
    const res = await this.cloneFactory.methods.setCreateNewRentalContractV2(
      props.price,
      '0',
      props.speed,
      String(props.durationSeconds),
      "0",
      "",
      props.pubKey,
    ).send({ from: props.from, gas: esimate, ...this.getGasConfig() });

    return { status: res.status, transactionHash: res.transactionHash };
  }

  async purchaseContract(props: { contractAddress: string, validatorAddress: string, encrValidatorURL: string, encrDestURL: string, termsVersion: string, buyer: string, feeETH: string }): Promise<SendStatus> {
    const gas = await this.cloneFactory.methods
      .setPurchaseRentalContractV2(
        props.contractAddress,
        props.validatorAddress,
        props.encrValidatorURL,
        props.encrDestURL,
        props.termsVersion,
      ).estimateGas({ from: props.buyer, value: props.feeETH });

    const res = await this.cloneFactory.methods.setPurchaseRentalContractV2(
      props.contractAddress,
      props.validatorAddress,
      props.encrValidatorURL,
      props.encrDestURL,
      props.termsVersion,
    ).send({ from: props.buyer, value: props.feeETH, gas });

		return { status: res.status, transactionHash: res.transactionHash };
	}

	async closeContract(props: {
		contractAddress: string;
		from: string;
		fee: string;
		closeoutType: CloseOutType;
	}): Promise<SendStatus> {
		const impl = Implementation(this.web3, props.contractAddress);
		const gas = await impl.methods
      .setContractCloseOut(String(props.closeoutType))
      .estimateGas({
			  from: props.from,
			  value: props.fee,
        ...this.getGasConfig(),
		  });

		const receipt = await impl.methods
			.setContractCloseOut(String(CloseOutType.BuyerOrValidatorCancel))
			.send({ 
        from: props.from, 
        value: props.fee, 
        gas,
        ...this.getGasConfig(), 
      });

    return { status: receipt.status, transactionHash: receipt.transactionHash };
  }

  async getContracts(){
    return await this.cloneFactory.methods.getContractList().call();
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
      isDeleted: data._isDeleted,
    };
  }

  async getContractPublicKey(contractAddress: string): Promise<string> {
    return Implementation(this.web3, contractAddress).methods.pubKey().call();
  }

  async getContractState(contractAddress: string): Promise<ContractState> {
    const state = await Implementation(this.web3, contractAddress).methods.contractState().call()
    switch (state) {
      case '0':
        return ContractState.Available;
      case '1':
        return ContractState.Running;
      default:
        throw new Error('Invalid state');
    }
  }

  async getContractHistory(contractAddress: string, offset = 0, limit = 100): Promise<HistoryentryResponse[]> {
    const history = await Implementation(this.web3, contractAddress)
      .methods
      .getHistory(String(offset), String(limit))
      .call();
    return history;
  }

  async increaseAllowance(price: string, from: string): Promise<SendStatus>{
    const res = await this.getLumerin().methods
      .increaseAllowance(this.cloneFactory.address, price)
      .send({ from, ...this.getGasConfig() });

    return { status: res.status, transactionHash: res.transactionHash };
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
			.estimateGas({ from: props.from, ...this.getGasConfig() });

		const receipt = await impl.methods
			.setDestination(props.encrValidatorURL, props.encrDestURL)
			.send({
				from: props.from,
				gas: gas,
        ...this.getGasConfig(),
			});

		return { status: receipt.status, transactionHash: receipt.transactionHash};
	}

	async editContractTerms(props: {
		contractAddress: string;
		from: string;
		price: string;
		speed: string;
		length: string;
		profitTarget: string;
	}): Promise<SendStatus> {
		const impl = Implementation(this.web3, props.contractAddress);
		const gas = await impl.methods
			.setUpdatePurchaseInformation(props.price, '0', props.speed, props.length, props.profitTarget)
			.estimateGas({ from: props.from });

		const receipt = await impl.methods
			.setUpdatePurchaseInformation(props.price, '0', props.speed, props.length, props.profitTarget)
			.send({ from: props.from, gas });

		return { status: receipt.status, transactionHash: receipt.transactionHash };
	}

  getGasConfig(){
    const chainId = process.env.REACT_APP_CHAIN_ID;
    if (chainId === '421614' || chainId === '42161') {
      // no priority fee on Arbitrum, maxFeePerGas is stable at 0.1 gwei
      return {
        maxPriorityFeePerGas: ethers.utils.parseUnits('0', 'gwei'),
        maxFeePerGas: ethers.utils.parseUnits('0.1', 'gwei'),
      };
    }
    return {};
  }
}
