import Web3 from 'web3';
import { HttpProvider } from 'web3-core';
import { Chain, createPublicClient, fallback, http, PublicClient } from 'viem';
import { abi as contracts } from 'contracts-js';
import { arbitrum, arbitrumSepolia, hardhat } from 'viem/chains';

const abi = contracts.validatorRegistryAbi;
const chains = {
	[arbitrumSepolia.id]: arbitrumSepolia,
	[arbitrum.id]: arbitrum,
	[hardhat.id]: hardhat,
} as const;

export class ValidatorRegistry {
	private registryAddr: string;
	private viemClient: PublicClient;

	constructor(web3Private: Web3, registryAddr: string, chainId: number) {
		this.registryAddr = registryAddr;
		this.viemClient = createPublicClient({
			transport: fallback([http(), http((web3Private.currentProvider as HttpProvider).host)]),
			chain: chains[chainId as keyof typeof chains],
		});
	}

	public async getRandomProvider() {
		const providerCount = await this.viemClient.readContract({
			abi: abi,
			address: this.registryAddr as `0x${string}`,
			functionName: 'activeValidatorsLength',
		});

		const randomIndex = BigInt(Math.abs(Math.random() * Number(providerCount)));

		const providerAddr = await this.viemClient.readContract({
			abi: abi,
			address: this.registryAddr as `0x${string}`,
			functionName: 'getActiveValidators',
			args: [randomIndex, 1],
		});

		const providerData = await this.viemClient.readContract({
			abi: abi,
			address: this.registryAddr as `0x${string}`,
			functionName: 'getValidator',
			args: [providerAddr[0]],
		});

		return providerData;
	}

	public async getValidators(offset: number, limit: number) {
		const providerCount = await this.viemClient.readContract({
			abi: abi,
			address: this.registryAddr as `0x${string}`,
			functionName: 'activeValidatorsLength',
		});

		const providerAddrs = await this.viemClient.readContract({
			abi: abi,
			address: this.registryAddr as `0x${string}`,
			functionName: 'getActiveValidators',
			args: [BigInt(offset), limit],
		});

		if (this.viemClient.chain?.contracts?.multicall3) {
			const providerData = await this.viemClient.multicall({
				allowFailure: false,
				contracts: (providerAddrs as string[]).map(
					(addr) =>
						({
							abi: abi,
							address: this.registryAddr as `0x${string}`,
							functionName: 'getValidator',
							args: [addr],
						} as const)
				),
			});

			return providerData;
		}

		return Promise.all((providerAddrs as string[]).map((addr) => this.getValidator(addr)));
	}

	public async getValidator(addr: string) {
		const providerData = await this.viemClient.readContract({
			abi: abi,
			address: this.registryAddr as `0x${string}`,
			functionName: 'getValidator',
			args: [addr as `0x${string}`],
		});

		return providerData;
	}

	private getChainPublicNodes(chainId: number): Chain {
		if (chainId == 421614) {
			return arbitrumSepolia;
		}

		return arbitrum;
	}
}
