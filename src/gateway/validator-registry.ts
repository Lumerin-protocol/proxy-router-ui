export const abi = [
	{
		inputs: [],
		name: 'AlreadyComplained',
		type: 'error',
	},
	{
		inputs: [],
		name: 'HostTooLong',
		type: 'error',
	},
	{
		inputs: [],
		name: 'InsufficientStake',
		type: 'error',
	},
	{
		inputs: [],
		name: 'InvalidInitialization',
		type: 'error',
	},
	{
		inputs: [],
		name: 'NotInitializing',
		type: 'error',
	},
	{
		inputs: [
			{
				internalType: 'address',
				name: 'owner',
				type: 'address',
			},
		],
		name: 'OwnableInvalidOwner',
		type: 'error',
	},
	{
		inputs: [
			{
				internalType: 'address',
				name: 'account',
				type: 'address',
			},
		],
		name: 'OwnableUnauthorizedAccount',
		type: 'error',
	},
	{
		inputs: [
			{
				internalType: 'address',
				name: 'token',
				type: 'address',
			},
		],
		name: 'SafeERC20FailedOperation',
		type: 'error',
	},
	{
		inputs: [],
		name: 'Unauthorized',
		type: 'error',
	},
	{
		inputs: [],
		name: 'ValidatorNotFound',
		type: 'error',
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: false,
				internalType: 'uint64',
				name: 'version',
				type: 'uint64',
			},
		],
		name: 'Initialized',
		type: 'event',
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: 'address',
				name: 'previousOwner',
				type: 'address',
			},
			{
				indexed: true,
				internalType: 'address',
				name: 'newOwner',
				type: 'address',
			},
		],
		name: 'OwnershipTransferred',
		type: 'event',
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: 'address',
				name: 'validator',
				type: 'address',
			},
			{
				indexed: true,
				internalType: 'address',
				name: 'complainer',
				type: 'address',
			},
		],
		name: 'ValidatorComplain',
		type: 'event',
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: 'address',
				name: 'validator',
				type: 'address',
			},
		],
		name: 'ValidatorDeregistered',
		type: 'event',
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: 'address',
				name: 'validator',
				type: 'address',
			},
		],
		name: 'ValidatorPunished',
		type: 'event',
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: 'address',
				name: 'validator',
				type: 'address',
			},
		],
		name: 'ValidatorRegisteredUpdated',
		type: 'event',
	},
	{
		inputs: [],
		name: 'activeValidatorsLength',
		outputs: [
			{
				internalType: 'uint256',
				name: '',
				type: 'uint256',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'address',
				name: 'validator',
				type: 'address',
			},
		],
		name: 'forceUpdateActive',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'uint256',
				name: 'offset',
				type: 'uint256',
			},
			{
				internalType: 'uint8',
				name: 'limit',
				type: 'uint8',
			},
		],
		name: 'getActiveValidators',
		outputs: [
			{
				internalType: 'address[]',
				name: '',
				type: 'address[]',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'address',
				name: 'addr',
				type: 'address',
			},
		],
		name: 'getValidator',
		outputs: [
			{
				components: [
					{
						internalType: 'uint256',
						name: 'stake',
						type: 'uint256',
					},
					{
						internalType: 'address',
						name: 'addr',
						type: 'address',
					},
					{
						internalType: 'bool',
						name: 'pubKeyYparity',
						type: 'bool',
					},
					{
						internalType: 'address',
						name: 'lastComplainer',
						type: 'address',
					},
					{
						internalType: 'uint8',
						name: 'complains',
						type: 'uint8',
					},
					{
						internalType: 'string',
						name: 'host',
						type: 'string',
					},
					{
						internalType: 'bytes32',
						name: 'pubKeyX',
						type: 'bytes32',
					},
				],
				internalType: 'struct ValidatorRegistry.Validator',
				name: '',
				type: 'tuple',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'uint256',
				name: 'offset',
				type: 'uint256',
			},
			{
				internalType: 'uint8',
				name: 'limit',
				type: 'uint8',
			},
		],
		name: 'getValidators',
		outputs: [
			{
				internalType: 'address[]',
				name: '',
				type: 'address[]',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'contract IERC20',
				name: '_token',
				type: 'address',
			},
			{
				internalType: 'uint256',
				name: '_stakeMinimun',
				type: 'uint256',
			},
			{
				internalType: 'uint256',
				name: '_stakeRegister',
				type: 'uint256',
			},
			{
				internalType: 'uint256',
				name: '_punishAmount',
				type: 'uint256',
			},
			{
				internalType: 'uint8',
				name: '_punishThreshold',
				type: 'uint8',
			},
		],
		name: 'initialize',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [],
		name: 'owner',
		outputs: [
			{
				internalType: 'address',
				name: '',
				type: 'address',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [],
		name: 'punishAmount',
		outputs: [
			{
				internalType: 'uint256',
				name: '',
				type: 'uint256',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [],
		name: 'punishThreshold',
		outputs: [
			{
				internalType: 'uint8',
				name: '',
				type: 'uint8',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [],
		name: 'renounceOwnership',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'uint256',
				name: 'val',
				type: 'uint256',
			},
		],
		name: 'setPunishAmount',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'uint8',
				name: 'val',
				type: 'uint8',
			},
		],
		name: 'setPunishThreshold',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'uint256',
				name: 'val',
				type: 'uint256',
			},
		],
		name: 'setStakeMinimum',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'uint256',
				name: 'val',
				type: 'uint256',
			},
		],
		name: 'setStakeRegister',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [],
		name: 'stakeMinimum',
		outputs: [
			{
				internalType: 'uint256',
				name: '',
				type: 'uint256',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [],
		name: 'stakeRegister',
		outputs: [
			{
				internalType: 'uint256',
				name: '',
				type: 'uint256',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [],
		name: 'token',
		outputs: [
			{
				internalType: 'contract IERC20',
				name: '',
				type: 'address',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [],
		name: 'totalStake',
		outputs: [
			{
				internalType: 'uint256',
				name: '',
				type: 'uint256',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'address',
				name: 'newOwner',
				type: 'address',
			},
		],
		name: 'transferOwnership',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'address',
				name: 'addr',
				type: 'address',
			},
		],
		name: 'validatorComplain',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [],
		name: 'validatorDeregister',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'uint256',
				name: 'stake',
				type: 'uint256',
			},
			{
				internalType: 'bool',
				name: 'pubKeyYparity',
				type: 'bool',
			},
			{
				internalType: 'bytes32',
				name: 'pubKeyX',
				type: 'bytes32',
			},
			{
				internalType: 'string',
				name: 'host',
				type: 'string',
			},
		],
		name: 'validatorRegister',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'address',
				name: '',
				type: 'address',
			},
		],
		name: 'validators',
		outputs: [
			{
				internalType: 'uint256',
				name: 'stake',
				type: 'uint256',
			},
			{
				internalType: 'address',
				name: 'addr',
				type: 'address',
			},
			{
				internalType: 'bool',
				name: 'pubKeyYparity',
				type: 'bool',
			},
			{
				internalType: 'address',
				name: 'lastComplainer',
				type: 'address',
			},
			{
				internalType: 'uint8',
				name: 'complains',
				type: 'uint8',
			},
			{
				internalType: 'string',
				name: 'host',
				type: 'string',
			},
			{
				internalType: 'bytes32',
				name: 'pubKeyX',
				type: 'bytes32',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [],
		name: 'validatorsLength',
		outputs: [
			{
				internalType: 'uint256',
				name: '',
				type: 'uint256',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [],
		name: 'withdraw',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
] as const;
