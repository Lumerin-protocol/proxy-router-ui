import { abi } from "contracts-js";
import {
  http,
  type Chain,
  type PublicClient,
  createClient,
  createPublicClient,
  createWalletClient,
  custom,
  fallback,
  getContract,
} from "viem";
import { mainnet } from "viem/chains";
import { CloseOutType, ContractState } from "../types/types";
import { sortContractsList } from "../utils/utils";
import type { IndexerContractEntry } from "./interfaces";
interface SendStatus {
  status: boolean;
  transactionHash: string;
}

function createViemClient() {
  return createClient({
    chain: mainnet,
    transport: fallback([custom(window.ethereum! as any), http()]),
  });
}

function getPublicClient() {
  return createPublicClient({
    chain: mainnet,
    transport: fallback([custom(window.ethereum! as any), http()]),
  });
}

function getWalletClient(chain: Chain) {
  return createWalletClient({
    transport: fallback([custom(window.ethereum! as any)]),
    chain,
  });
}

function getIERC20(client: ReturnType<typeof createViemClient>, address: `0x${string}`) {
  return getContract({
    address: address,
    abi: abi.usdcMockAbi,
    client,
  });
}

function getCloneFactory(client: ReturnType<typeof createViemClient>, address: `0x${string}`) {
  return getContract({
    address: address,
    abi: abi.cloneFactoryAbi,
    client,
  });
}

export class EthereumGateway {
  private cloneFactory: ReturnType<typeof getCloneFactory> | null = null;
  private paymentToken: ReturnType<typeof getIERC20> | null = null;
  private feeToken: ReturnType<typeof getIERC20> | null = null;
  private contractIndexerUrl: string;
  private feeRate: number | null = null;
  private client: ReturnType<typeof createViemClient>;
  private pc: ReturnType<typeof getPublicClient>;
  private wc: ReturnType<typeof getWalletClient>;

  constructor(cloneFactoryAddr: string, contractIndexerUrl: string, pc: PublicClient) {
    this.contractIndexerUrl = contractIndexerUrl;
    this.client = createViemClient();
    this.pc = pc as any;
    this.cloneFactory = getCloneFactory(this.client, cloneFactoryAddr as `0x${string}`);
    this.wc = getWalletClient(pc.chain);
  }

  async getAccounts() {
    return await this.wc.requestAddresses();
  }

  async init() {
    const feeTokenAddr = await this._getFeeToken();
    const paymentTokenAddr = await this._getPaymentToken();
    this.paymentToken = getIERC20(this.client, paymentTokenAddr);
    this.feeToken = getIERC20(this.client, feeTokenAddr);
    this.feeRate = await this._getFeeRate();
    console.log("web3 gateway initialized");
  }

  async _getPaymentToken(): Promise<`0x${string}`> {
    return await this.cloneFactory!.read.paymentToken();
  }

  async _getFeeToken(): Promise<`0x${string}`> {
    return await this.cloneFactory!.read.feeToken();
  }

  async _getFeeRate(): Promise<number> {
    const feeRateScaled = await this.cloneFactory!.read.validatorFeeRateScaled();
    const feeDecimals = await this.cloneFactory!.read.VALIDATOR_FEE_DECIMALS();
    return Number(feeRateScaled) / Number(feeDecimals);
  }

  async getPaymentToken() {
    if (!this.paymentToken) {
      await this.init();
    }
    return this.paymentToken!;
  }

  async getFeeToken() {
    if (!this.feeToken) {
      await this.init();
    }
    return this.feeToken!;
  }

  async getCurrentBlockTimestamp(): Promise<number> {
    return await this.pc.getBlock({ blockTag: "latest" }).then((block) => Number(block.timestamp));
  }

  async getPaymentTokenBalance(address: string): Promise<string> {
    return String(await (await this.getPaymentToken()).read.balanceOf([address as `0x${string}`]));
  }

  async getFeeTokenBalance(address: string): Promise<string> {
    return String(await (await this.getFeeToken()).read.balanceOf([address as `0x${string}`]));
  }

  async createContract(props: {
    speed: string;
    durationSeconds: number;
    pubKey: string;
    profitTarget: string;
    from: string;
  }): Promise<SendStatus> {
    return { status: false, transactionHash: "" };
  }

  async purchaseContract(props: {
    contractAddress: string;
    validatorAddress: string;
    encrValidatorURL: string;
    encrDestURL: string;
    termsVersion: string;
    buyer: string;
  }): Promise<SendStatus & { timestamp: bigint }> {
    const req = await this.cloneFactory!.simulate.setPurchaseRentalContractV2(
      [
        props.contractAddress as `0x${string}`,
        props.validatorAddress as `0x${string}`,
        props.encrValidatorURL,
        props.encrDestURL,
        Number(props.termsVersion),
      ],
      { account: props.buyer as `0x${string}` },
    );

    const walletClient = getWalletClient(this.pc.chain!);
    const hash = await walletClient.writeContract(req.request);

    const receipt = await this.pc.waitForTransactionReceipt({ hash });
    const block = await this.pc.getBlock({ blockNumber: receipt.blockNumber });

    return {
      status: receipt.status === "success",
      transactionHash: receipt.transactionHash,
      timestamp: block.timestamp,
    };
  }

  async closeContract(props: { contractAddress: string; from: string }): Promise<SendStatus> {
    const impl = getContract({
      address: props.contractAddress as `0x${string}`,
      abi: abi.implementationAbi,
      client: this.client,
    });
    const walletClient = getWalletClient(this.pc.chain!);

    const req = await impl.simulate.closeEarly([0], {
      account: props.from as `0x${string}`,
    });

    const hash = await walletClient.writeContract(req.request);
    const receipt = await this.pc.waitForTransactionReceipt({ hash });

    return { status: receipt.status === "success", transactionHash: receipt.transactionHash };
  }

  async getContractsV2(walletAddr: string): Promise<IndexerContractEntry[]> {
    try {
      const url = new URL("/api/contracts", this.contractIndexerUrl);
      url.searchParams.append("walletAddr", walletAddr);
      const data = await fetch(url);
      const json = (await data.json()) as IndexerContractEntry[];
      return sortContractsList(json, (c) => Number(c.stats.successCount), "asc");
    } catch (e) {
      const err = new Error(`Error calling contract indexer: ${(e as Error)?.message}`, {
        cause: e,
      });
      console.error(err);
      throw err;
    }
  }

  async getContractPublicKey(contractAddress: string): Promise<string> {
    const impl = getContract({
      address: contractAddress as `0x${string}`,
      abi: abi.implementationAbi,
      client: this.client,
    });
    return await impl.read.pubKey();
  }

  async getContractState(contractAddress: string): Promise<ContractState> {
    const impl = getContract({
      address: contractAddress as `0x${string}`,
      abi: abi.implementationAbi,
      client: this.client,
    });
    const state = await impl.read.contractState();
    switch (state) {
      case 0:
        return ContractState.Available;
      case 1:
        return ContractState.Running;
      default:
        throw new Error("Invalid state");
    }
  }

  async approvePayment(price: string, from: string): Promise<SendStatus> {
    const currentAllowance = await (await this.getPaymentToken()).read.allowance([
      from as `0x${string}`,
      this.cloneFactory?.address!,
    ]);
    if (currentAllowance >= BigInt(price)) {
      return { status: true, transactionHash: "" };
    }
    const req = await (await this.getPaymentToken()).simulate.approve([this.cloneFactory?.address!, BigInt(price)], {
      account: from as `0x${string}`,
    });
    const walletClient = getWalletClient(this.pc.chain!);
    const hash = await walletClient.writeContract(req.request);
    const receipt = await this.pc.waitForTransactionReceipt({ hash });
    return { status: receipt.status === "success", transactionHash: receipt.transactionHash };
  }

  async approveFee(price: string, from: string): Promise<SendStatus> {
    const currentAllowance = await (await this.getFeeToken()).read.allowance([
      from as `0x${string}`,
      this.cloneFactory?.address!,
    ]);
    if (currentAllowance >= BigInt(price)) {
      return { status: true, transactionHash: "" };
    }
    const req = await (await this.getFeeToken()).simulate.approve([this.cloneFactory?.address!, BigInt(price)], {
      account: from as `0x${string}`,
    });
    const walletClient = getWalletClient(this.pc.chain!);
    const hash = await walletClient.writeContract(req.request);
    const receipt = await this.pc.waitForTransactionReceipt({ hash });
    return { status: receipt.status === "success", transactionHash: receipt.transactionHash };
  }

  async editContractDestination(props: {
    contractAddress: string;
    from: string;
    encrValidatorURL: string;
    encrDestURL: string;
  }): Promise<SendStatus> {
    const impl = getContract({
      address: props.contractAddress as `0x${string}`,
      abi: abi.implementationAbi,
      client: this.client,
    });
    const req = await impl.simulate.setDestination([props.encrValidatorURL, props.encrDestURL], {
      account: props.from as `0x${string}`,
    });
    const walletClient = getWalletClient(this.pc.chain!);
    const hash = await walletClient.writeContract(req.request);
    const receipt = await this.pc.waitForTransactionReceipt({ hash });
    return { status: receipt.status === "success", transactionHash: receipt.transactionHash };
  }

  async editContractTerms(props: {
    contractAddress: string;
    from: string;
    // price: string;
    speed: string;
    length: string;
    profitTarget: string;
  }): Promise<SendStatus> {
    // const impl = Implementation(this.web3Pub, props.contractAddress);
    // const gas = await impl.methods
    // 	.setUpdatePurchaseInformation(props.speed, props.length, props.profitTarget)
    // 	.estimateGas({ from: props.from, ...(await this.getGasConfig()) });

    // const receipt = await impl.methods
    // 	.setUpdatePurchaseInformation(props.speed, props.length, props.profitTarget)
    // 	.send({ from: props.from, gas, ...(await this.getGasConfig()) });

    // return { status: receipt.status, transactionHash: receipt.transactionHash };
    return { status: false, transactionHash: "" };
  }

  async getEthBalance(address: string): Promise<string> {
    const balance = await this.pc.getBalance({ address: address as `0x${string}` });
    return balance.toString();
  }
}
