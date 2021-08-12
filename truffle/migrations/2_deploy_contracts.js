var TestToken = artifacts.require('../contracts/TestToken.sol');

module.exports = async function (deployer) {
	deployer.deploy(TestToken, 1000000);
};
