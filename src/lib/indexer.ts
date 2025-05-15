export const getTxUrl = (txHash: `0x${string}`) => {
  return `${process.env.REACT_APP_ETHERSCAN_URL}/tx/${txHash}`;
};

export const getContractUrl = (contractAddress: `0x${string}`) => {
  return `${process.env.REACT_APP_ETHERSCAN_URL}/address/${contractAddress}`;
};
