export const implementationAbi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_cloneFactory",
        type: "address",
      },
      {
        internalType: "address",
        name: "_hashrateOracle",
        type: "address",
      },
      {
        internalType: "address",
        name: "_paymentToken",
        type: "address",
      },
      {
        internalType: "address",
        name: "_feeToken",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "InvalidInitialization",
    type: "error",
  },
  {
    inputs: [],
    name: "NotInitializing",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
    ],
    name: "SafeERC20FailedOperation",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint64",
        name: "version",
        type: "uint64",
      },
    ],
    name: "Initialized",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "_buyer",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "_validator",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "_seller",
        type: "address",
      },
      {
        indexed: false,
        internalType: "enum Implementation.CloseReason",
        name: "_reason",
        type: "uint8",
      },
      {
        components: [
          {
            internalType: "bool",
            name: "isResellable",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "isResellToDefaultBuyer",
            type: "bool",
          },
        ],
        indexed: false,
        internalType: "struct ResellFlags",
        name: "_resellFlags",
        type: "tuple",
      },
    ],
    name: "contractClosedEarly",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "_buyer",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "_validator",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "_seller",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "_price",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "_fee",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "_resellPrice",
        type: "uint256",
      },
      {
        components: [
          {
            internalType: "bool",
            name: "isResellable",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "isResellToDefaultBuyer",
            type: "bool",
          },
        ],
        indexed: false,
        internalType: "struct ResellFlags",
        name: "_resellFlags",
        type: "tuple",
      },
    ],
    name: "contractPurchased",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "_speed",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "_length",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint32",
        name: "_version",
        type: "uint32",
      },
    ],
    name: "contractTermsUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "string",
        name: "newValidatorURL",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "newDestURL",
        type: "string",
      },
    ],
    name: "destinationUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [],
    name: "fundsClaimed",
    type: "event",
  },
  {
    inputs: [],
    name: "VALIDATOR_FEE_DECIMALS",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "VERSION",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "claimFunds",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "cloneFactory",
    outputs: [
      {
        internalType: "contract CloneFactory",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "enum Implementation.CloseReason",
        name: "reason",
        type: "uint8",
      },
    ],
    name: "closeEarly",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "contractState",
    outputs: [
      {
        internalType: "enum Implementation.ContractState",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "failCount",
    outputs: [
      {
        internalType: "uint32",
        name: "",
        type: "uint32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "feeToken",
    outputs: [
      {
        internalType: "contract IERC20",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "futureTerms",
    outputs: [
      {
        internalType: "uint256",
        name: "_speed",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_length",
        type: "uint256",
      },
      {
        internalType: "uint32",
        name: "_version",
        type: "uint32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getLatestResell",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "_buyer",
            type: "address",
          },
          {
            internalType: "address",
            name: "_validator",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "_price",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "_fee",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "_startTime",
            type: "uint256",
          },
          {
            internalType: "string",
            name: "_encrDestURL",
            type: "string",
          },
          {
            internalType: "string",
            name: "_encrValidatorURL",
            type: "string",
          },
          {
            internalType: "uint256",
            name: "_lastSettlementTime",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "_seller",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "_resellPrice",
            type: "uint256",
          },
          {
            internalType: "int8",
            name: "_resellProfitTarget",
            type: "int8",
          },
          {
            internalType: "bool",
            name: "_isResellable",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "_isResellToDefaultBuyer",
            type: "bool",
          },
        ],
        internalType: "struct Implementation.ResellTerms",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "hashrateOracle",
    outputs: [
      {
        internalType: "contract HashrateOracle",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_seller",
        type: "address",
      },
      {
        internalType: "string",
        name: "_pubKey",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "_speed",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_length",
        type: "uint256",
      },
      {
        internalType: "int8",
        name: "_profitTarget",
        type: "int8",
      },
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "isDeleted",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "isReselling",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "paymentToken",
    outputs: [
      {
        internalType: "contract IERC20",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "priceAndFee",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "int8",
        name: "_profitTarget",
        type: "int8",
      },
    ],
    name: "priceV2",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "pubKey",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "resellChain",
    outputs: [
      {
        internalType: "address",
        name: "_buyer",
        type: "address",
      },
      {
        internalType: "address",
        name: "_validator",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_price",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_fee",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_startTime",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "_encrDestURL",
        type: "string",
      },
      {
        internalType: "string",
        name: "_encrValidatorURL",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "_lastSettlementTime",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "_seller",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_resellPrice",
        type: "uint256",
      },
      {
        internalType: "int8",
        name: "_resellProfitTarget",
        type: "int8",
      },
      {
        internalType: "bool",
        name: "_isResellable",
        type: "bool",
      },
      {
        internalType: "bool",
        name: "_isResellToDefaultBuyer",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "seller",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bool",
        name: "_isDeleted",
        type: "bool",
      },
    ],
    name: "setContractDeleted",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_encrValidatorURL",
        type: "string",
      },
      {
        internalType: "string",
        name: "_encrDestURL",
        type: "string",
      },
    ],
    name: "setDestination",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_encrValidatorURL",
        type: "string",
      },
      {
        internalType: "string",
        name: "_encrDestURL",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "_price",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_fee",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "_buyer",
        type: "address",
      },
      {
        internalType: "address",
        name: "_seller",
        type: "address",
      },
      {
        internalType: "address",
        name: "_validator",
        type: "address",
      },
      {
        components: [
          {
            internalType: "bool",
            name: "isResellable",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "isResellToDefaultBuyer",
            type: "bool",
          },
        ],
        internalType: "struct ResellFlags",
        name: "_resellFlags",
        type: "tuple",
      },
      {
        internalType: "uint256",
        name: "_resellPrice",
        type: "uint256",
      },
    ],
    name: "setPurchaseContract",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_speed",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_length",
        type: "uint256",
      },
    ],
    name: "setTerms",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "successCount",
    outputs: [
      {
        internalType: "uint32",
        name: "",
        type: "uint32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "terms",
    outputs: [
      {
        internalType: "uint256",
        name: "_speed",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_length",
        type: "uint256",
      },
      {
        internalType: "uint32",
        name: "_version",
        type: "uint32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;
