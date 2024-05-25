const REGISTRUM_ABI = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "documentId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "string",
        name: "documentHash",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "proofHash",
        type: "string",
      },
    ],
    name: "DocumentRegistered",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "documentId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "string",
        name: "updatedProofHash",
        type: "string",
      },
    ],
    name: "DocumentTransferred",
    type: "event",
  },
  {
    inputs: [],
    name: "documentId",
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
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "documents",
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
    name: "owners",
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
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "proofs",
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
        internalType: "string",
        name: "documentHash",
        type: "string",
      },
      {
        internalType: "string",
        name: "proofHash",
        type: "string",
      },
    ],
    name: "registerDocument",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_documentId",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "updatedProofHash",
        type: "string",
      },
    ],
    name: "transferDocument",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "whitelistFirm",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];
module.exports = REGISTRUM_ABI;
