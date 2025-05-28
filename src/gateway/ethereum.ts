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
  recoverPublicKey,
  hashMessage,
  zeroAddress,
  encodeFunctionData,
} from "viem";
import { ContractState } from "../types/types";
import { sortContractsList } from "../utils/utils";
import type { IndexerContractEntry } from "./interfaces";

const { cloneFactoryAbi } = abi;

interface SendStatus {
  status: boolean;
  transactionHash?: `0x${string}`; // undefined if the transaction skipped because not needed
}

type ActionStatus = {
  status: boolean;
  txHash: `0x${string}`;
  blockNumber: bigint;
};

type ActionStatusWithTimestamp = ActionStatus & {
  timestamp: bigint;
};

function createViemClient(chain: Chain) {
  return createClient({
    chain,
    transport: fallback([custom(window.ethereum! as any), http()]),
  });
}

function getPublicClient(chain: Chain) {
  return createPublicClient({
    chain,
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
    abi: cloneFactoryAbi,
    client,
  });
}

function getMulticall(client: ReturnType<typeof createViemClient>, address?: `0x${string}`) {
  const multicall = client.chain?.contracts?.multicall3?.address || address;
  if (!multicall) {
    throw new Error("Multicall3 contract not found");
  }

  return getContract({
    address: multicall,
    abi: abi.multicall3Abi,
    client,
  });
}

export class EthereumGateway {
  private cloneFactory: ReturnType<typeof getCloneFactory> | null = null;
  private paymentToken: ReturnType<typeof getIERC20> | null = null;
  private feeToken: ReturnType<typeof getIERC20> | null = null;
  private contractIndexerUrl: string;
  private client: ReturnType<typeof createViemClient>;
  private pc: ReturnType<typeof getPublicClient>;
  private wc: ReturnType<typeof getWalletClient>;

  constructor(cloneFactoryAddr: string, contractIndexerUrl: string, pc: PublicClient) {
    this.contractIndexerUrl = contractIndexerUrl;
    this.client = createViemClient(pc.chain!);
    this.pc = pc as any;
    this.cloneFactory = getCloneFactory(this.client, cloneFactoryAddr as `0x${string}`);
    this.wc = getWalletClient(pc.chain!);
  }

  async getAccounts() {
    return await this.wc.requestAddresses();
  }

  async init() {
    const feeTokenAddr = await this._getFeeToken();
    const paymentTokenAddr = await this._getPaymentToken();
    this.paymentToken = getIERC20(this.client, paymentTokenAddr);
    this.feeToken = getIERC20(this.client, feeTokenAddr);
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

  async getPublicKey(from: `0x${string}`): Promise<`0x${string}`> {
    const message = "Sign this message so we can obtain your Public Key";
    const signature = await this.wc.signMessage({ message, account: from });
    const publicKey = await recoverPublicKey({ hash: hashMessage(message), signature });
    return publicKey;
  }

  async createContract(props: {
    speedHPS: bigint;
    durationSeconds: bigint;
    profitTargetPercent: bigint;
    publicKey: `0x${string}`;
    from: `0x${string}`;
  }): Promise<ActionStatus> {
    // const message = "";
    // const signature = await this.wc.signMessage({ message, account: props.from });
    // const publicKey = await recoverPublicKey({ hash: hashMessage(message), signature });

    const req = await this.cloneFactory!.simulate.setCreateNewRentalContractV2(
      [0n, 0n, props.speedHPS, props.durationSeconds, Number(props.profitTargetPercent), zeroAddress, props.publicKey],
      { account: props.from },
    );

    const hash = await this.wc.writeContract(req.request);
    // const receipt = await this.pc.waitForTransactionReceipt({ hash });

    return {
      status: true,
      txHash: hash,
      blockNumber: 0n,
    };
  }

  async purchaseContract(props: {
    contractAddress: string;
    validatorAddress: string;
    encrValidatorURL: string;
    encrDestURL: string;
    termsVersion: string;
    buyer: string;
  }): Promise<ActionStatusWithTimestamp> {
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
    return { status: true, txHash: hash, blockNumber: 0n, timestamp: 0n };
    // const receipt = await this.pc.waitForTransactionReceipt({ hash });
    // const block = await this.pc.getBlock({ blockNumber: receipt.blockNumber });

    // return {
    //   status: receipt.status === "success",
    //   txHash: receipt.transactionHash,
    //   blockNumber: receipt.blockNumber,
    //   timestamp: block.timestamp,
    // };
  }

  async closeContract(props: { contractAddress: string; from: string }): Promise<ActionStatus> {
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
    // const receipt = await this.pc.waitForTransactionReceipt({ hash });

    return {
      status: true,
      txHash: hash,
      blockNumber: 0n,
    };
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
      return { status: true };
    }
    const req = await (await this.getPaymentToken()).simulate.approve([this.cloneFactory?.address!, BigInt(price)], {
      account: from as `0x${string}`,
    });
    const walletClient = getWalletClient(this.pc.chain!);
    const hash = await walletClient.writeContract(req.request);
    return { status: true, transactionHash: hash };
    // const receipt = await this.pc.waitForTransactionReceipt({ hash });
    // return { status: receipt.status === "success", transactionHash: receipt.transactionHash };
  }

  async approveFee(price: string, from: string): Promise<SendStatus> {
    const currentAllowance = await (await this.getFeeToken()).read.allowance([
      from as `0x${string}`,
      this.cloneFactory?.address!,
    ]);
    if (currentAllowance >= BigInt(price)) {
      return { status: true };
    }
    const req = await (await this.getFeeToken()).simulate.approve([this.cloneFactory?.address!, BigInt(price)], {
      account: from as `0x${string}`,
    });
    const walletClient = getWalletClient(this.pc.chain!);
    const hash = await walletClient.writeContract(req.request);
    // const receipt = await this.pc.waitForTransactionReceipt({ hash });
    // return { status: receipt.status === "success", transactionHash: receipt.transactionHash };
    return { status: true, transactionHash: hash };
  }

  async editContractDestination(props: {
    contractAddress: string;
    from: string;
    encrValidatorURL: string;
    encrDestURL: string;
  }): Promise<ActionStatus> {
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
    // const receipt = await this.pc.waitForTransactionReceipt({ hash });
    return {
      status: true,
      txHash: hash,
      blockNumber: 0n,
    };
  }

  async editContractTerms(props: {
    contractAddress: string;
    speedHPS: bigint;
    durationSeconds: bigint;
    profitTargetPercent: bigint;
    from: `0x${string}`;
  }): Promise<ActionStatus> {
    const req = await this.cloneFactory!.simulate.setUpdateContractInformationV2(
      [
        props.contractAddress as `0x${string}`,
        0n,
        0n,
        props.speedHPS,
        props.durationSeconds,
        Number(props.profitTargetPercent),
      ],
      { account: props.from },
    );

    const walletClient = getWalletClient(this.pc.chain!);
    const hash = await walletClient.writeContract(req.request);
    // const receipt = await this.pc.waitForTransactionReceipt({ hash });
    return {
      status: true,
      txHash: hash,
      blockNumber: 0n,
    };
  }

  async getEthBalance(address: string): Promise<string> {
    const balance = await this.pc.getBalance({ address: address as `0x${string}` });
    return balance.toString();
  }

  async claimFunds(contractAddress: string, from: string): Promise<ActionStatus> {
    const impl = getContract({
      address: contractAddress as `0x${string}`,
      abi: abi.implementationAbi,
      client: this.client,
    });

    const req = await impl.simulate.claimFunds({
      account: from as `0x${string}`,
    });

    const walletClient = getWalletClient(this.pc.chain!);
    const hash = await walletClient.writeContract(req.request);
    // const receipt = await this.pc.waitForTransactionReceipt({ hash });
    return {
      status: true,
      txHash: hash,
      blockNumber: 0n,
    };
  }

  async claimFundsBatch(contractAddresses: `0x${string}`[], from: string): Promise<ActionStatus> {
    const multicall = getMulticall(this.client, process.env.REACT_APP_MULTICALL_ADDRESS);
    const calldata = contractAddresses.map(
      (addr) =>
        ({
          target: addr,
          allowFailure: true,
          callData: encodeFunctionData({
            abi: abi.implementationAbi,
            functionName: "claimFunds",
          }),
        }) as const,
    );
    const req = await multicall.simulate.aggregate3([calldata], {
      account: from as `0x${string}`,
    });

    const walletClient = getWalletClient(this.pc.chain!);
    const hash = await walletClient.writeContract(req.request);
    // const receipt = await this.pc.waitForTransactionReceipt({ hash });
    return {
      status: true,
      txHash: hash,
      blockNumber: 0n,
    };
  }

  async setContractDeleted(contractAddress: string, isDeleted: boolean, from: string): Promise<ActionStatus> {
    const req = await this.cloneFactory!.simulate.setContractsDeleted([[contractAddress as `0x${string}`], isDeleted], {
      account: from as `0x${string}`,
    });

    const walletClient = getWalletClient(this.pc.chain!);
    const hash = await walletClient.writeContract(req.request);
    // const receipt = await this.pc.waitForTransactionReceipt({ hash });
    return {
      status: true,
      txHash: hash,
      blockNumber: 0n,
    };
  }

  async setContractsDeleted(
    contractAddresses: `0x${string}`[],
    isDeleted: boolean,
    from: string,
  ): Promise<ActionStatus> {
    const req = await this.cloneFactory!.simulate.setContractsDeleted([contractAddresses, isDeleted], {
      account: from as `0x${string}`,
    });

    const walletClient = getWalletClient(this.pc.chain!);
    const hash = await walletClient.writeContract(req.request);
    // const receipt = await this.pc.waitForTransactionReceipt({ hash });
    return {
      status: true,
      txHash: hash,
      blockNumber: 0n,
    };
  }
}
