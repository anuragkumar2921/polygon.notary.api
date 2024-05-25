const Web3 = require("web3");
const REGISTRUM_ABI = require("../abis/Registrum");
const { BlockchainError } = require("../exceptions");

const {
  INFURA_RINKEBY,
  ADMIN_ACCOUNT,
  REGISTRUM_CONTRACT_ADDRESS,
  CHAIN_ID,
} = require("../constants");

const privateKey =
  "9ced470439e322b222d7d0592c62a38a1a2f3832a10e77e6b685e91acab31262";
//TODO remove private key

const pushToBlockchain = async (documentHash, proofHash) => {
  try {
    const web3 = new Web3(INFURA_RINKEBY);
    const contractInstance = new web3.eth.Contract(
      REGISTRUM_ABI,
      REGISTRUM_CONTRACT_ADDRESS
    );
    const documentId = await contractInstance.methods.documentId.call().call();
    const tx = contractInstance.methods.registerDocument(
      documentHash,
      proofHash
    );
    const gas = await tx.estimateGas({ from: ADMIN_ACCOUNT });
    const gasPrice = await web3.eth.getGasPrice();
    const data = tx.encodeABI();
    const nonce = await web3.eth.getTransactionCount(ADMIN_ACCOUNT);
    console.log("transactionNonce", nonce);
    const signedTx = await web3.eth.accounts.signTransaction(
      {
        to: contractInstance.options.address,
        data,
        gas,
        gasPrice,
        nonce,
        chainId: CHAIN_ID,
      },
      privateKey
    );
    const receipt = await web3.eth.sendSignedTransaction(
      signedTx.rawTransaction
    );
    console.log(`Transaction hash: ${receipt.transactionHash}`);
    return {
      transactionHash: receipt.transactionHash,
      documentId,
    };
  } catch (e) {
    console.log("Something went wrong while uploading to blockchain", e);
    throw new BlockchainError(
      "Something went wrong while uploading to blockchain.. Please try again later"
    );
  }
};

const transferBlockchain = async (documentId, updatedProof) => {
  try {
    const web3 = new Web3(INFURA_RINKEBY);
    const contractInstance = new web3.eth.Contract(
      REGISTRUM_ABI,
      REGISTRUM_CONTRACT_ADDRESS
    );
    const tx = contractInstance.methods.transferDocument(
      documentId,
      updatedProof
    );
    const gas = await tx.estimateGas({ from: ADMIN_ACCOUNT });
    const gasPrice = await web3.eth.getGasPrice();
    const data = tx.encodeABI();
    const nonce = await web3.eth.getTransactionCount(ADMIN_ACCOUNT);
    console.log("transactionNonce", nonce);
    const signedTx = await web3.eth.accounts.signTransaction(
      {
        to: contractInstance.options.address,
        data,
        gas,
        gasPrice,
        nonce,
        chainId: CHAIN_ID,
      },
      privateKey
    );
    const receipt = await web3.eth.sendSignedTransaction(
      signedTx.rawTransaction
    );
    console.log(`Transaction hash: ${receipt.transactionHash}`);
    return receipt.transactionHash;
  } catch (e) {
    console.log("Something went wrong while transferring to blockchain", e);
    throw new BlockchainError(
      "Something went wrong while transferring to blockchain.. Please try again later"
    );
  }
};
const getDocumentHash = async (documentId,type) => {
  const web3 = new Web3(INFURA_RINKEBY);
  const contractInstance = new web3.eth.Contract(
    REGISTRUM_ABI,
    REGISTRUM_CONTRACT_ADDRESS
  );
  const documentHash = await contractInstance.methods.documents(
    documentId
  ).call();
  const proofHash = await contractInstance.methods.documents(
    documentId
  ).call();
  return {
    documentHash,
    proofHash,
  };
}
const checkBalance = async (address) => {
  const web3 = new Web3(INFURA_RINKEBY);
  const balance = await web3.eth.getBalance(address);
  return balance;
};
const fundAccount = async (address) => {
  const web3 = new Web3(INFURA_RINKEBY);
  const gas = await tx.estimateGas({ from: ADMIN_ACCOUNT });
  const gasPrice = await web3.eth.getGasPrice();
  const signedTx = await web3.eth.accounts.signTransaction(
    {
      to: contractInstance.options.address,
      value: web3.utils.toWei("0.01", "ether"),
      gas,
      gasPrice,
      nonce,
      chainId: CHAIN_ID,
    },
    privateKey
  );
};

module.exports = {
  pushToBlockchain,
  transferBlockchain,
};
