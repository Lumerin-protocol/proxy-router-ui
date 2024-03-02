export const ImplementationAbi = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint8",
        "name": "version",
        "type": "uint8"
      }
    ],
    "name": "Initialized",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "string",
        "name": "newCipherText",
        "type": "string"
      }
    ],
    "name": "cipherTextUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "_buyer",
        "type": "address"
      }
    ],
    "name": "contractClosed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "_buyer",
        "type": "address"
      }
    ],
    "name": "contractPurchased",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "string",
        "name": "newValidatorURL",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "newDestURL",
        "type": "string"
      }
    ],
    "name": "destinationUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "_address",
        "type": "address"
      }
    ],
    "name": "purchaseInfoUpdated",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "buyer",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "cloneFactory",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "contractState",
    "outputs": [
      {
        "internalType": "enum Implementation.ContractState",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "contractTotal",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "encrDestURL",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "encrValidatorURL",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "escrow_purchaser",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "escrow_seller",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "futureTerms",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "_price",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_limit",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_speed",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_length",
        "type": "uint256"
      },
      {
        "internalType": "uint32",
        "name": "_version",
        "type": "uint32"
      },
      {
        "internalType": "int8",
        "name": "_profitTarget",
        "type": "int8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_offset",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_limit",
        "type": "uint256"
      }
    ],
    "name": "getHistory",
    "outputs": [
      {
        "components": [
          {
            "internalType": "bool",
            "name": "_goodCloseout",
            "type": "bool"
          },
          {
            "internalType": "uint256",
            "name": "_purchaseTime",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "_endTime",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "_price",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "_speed",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "_length",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "_buyer",
            "type": "address"
          }
        ],
        "internalType": "struct Implementation.HistoryEntry[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getPublicVariables",
    "outputs": [
      {
        "internalType": "enum Implementation.ContractState",
        "name": "_state",
        "type": "uint8"
      },
      {
        "internalType": "uint256",
        "name": "_price",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_limit",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_speed",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_length",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_startingBlockTimestamp",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "_buyer",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_seller",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "_encryptedPoolData",
        "type": "string"
      },
      {
        "internalType": "bool",
        "name": "_isDeleted",
        "type": "bool"
      },
      {
        "internalType": "uint256",
        "name": "_balance",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "_hasFutureTerms",
        "type": "bool"
      },
      {
        "internalType": "uint32",
        "name": "_version",
        "type": "uint32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getPublicVariablesV2",
    "outputs": [
      {
        "internalType": "enum Implementation.ContractState",
        "name": "_state",
        "type": "uint8"
      },
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "_price",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "_limit",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "_speed",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "_length",
            "type": "uint256"
          },
          {
            "internalType": "uint32",
            "name": "_version",
            "type": "uint32"
          },
          {
            "internalType": "int8",
            "name": "_profitTarget",
            "type": "int8"
          }
        ],
        "internalType": "struct Implementation.Terms",
        "name": "_terms",
        "type": "tuple"
      },
      {
        "internalType": "uint256",
        "name": "_startingBlockTimestamp",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "_buyer",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_seller",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "_encryptedPoolData",
        "type": "string"
      },
      {
        "internalType": "bool",
        "name": "_isDeleted",
        "type": "bool"
      },
      {
        "internalType": "uint256",
        "name": "_balance",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "_hasFutureTerms",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getStats",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "_successCount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_failCount",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "history",
    "outputs": [
      {
        "internalType": "bool",
        "name": "_goodCloseout",
        "type": "bool"
      },
      {
        "internalType": "uint256",
        "name": "_purchaseTime",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_endTime",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_price",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_speed",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_length",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "_buyer",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_price",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_limit",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_speed",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_length",
        "type": "uint256"
      },
      {
        "internalType": "int8",
        "name": "_profitTarget",
        "type": "int8"
      },
      {
        "internalType": "address",
        "name": "_seller",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_lmrAddress",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_cloneFactory",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_validator",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "_pubKey",
        "type": "string"
      }
    ],
    "name": "initialize",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "isDeleted",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "pubKey",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "seller",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "closeOutType",
        "type": "uint256"
      }
    ],
    "name": "setContractCloseOut",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bool",
        "name": "_isDeleted",
        "type": "bool"
      }
    ],
    "name": "setContractDeleted",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_encrValidatorURL",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_encrDestURL",
        "type": "string"
      }
    ],
    "name": "setDestination",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_encrValidatorURL",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_encrDestURL",
        "type": "string"
      },
      {
        "internalType": "address",
        "name": "_buyer",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_validator",
        "type": "address"
      }
    ],
    "name": "setPurchaseContract",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_newEncryptedPoolData",
        "type": "string"
      }
    ],
    "name": "setUpdateMiningInformation",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_price",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_limit",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_speed",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_length",
        "type": "uint256"
      },
      {
        "internalType": "int8",
        "name": "_profitTarget",
        "type": "int8"
      }
    ],
    "name": "setUpdatePurchaseInformation",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "startingBlockTimestamp",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "terms",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "_price",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_limit",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_speed",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_length",
        "type": "uint256"
      },
      {
        "internalType": "uint32",
        "name": "_version",
        "type": "uint32"
      },
      {
        "internalType": "int8",
        "name": "_profitTarget",
        "type": "int8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "validator",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;
