import { getContractPrice } from '../web3/helpers';
import Web3 from 'web3';

describe('helpers', () => {
	describe('getContractPrice', () => {
		it('works', () => {
			// Arrange
			const web3 = new Web3(Web3.givenProvider);
			const price = 100000000;

			// Act
			const result = getContractPrice(web3, price);

			// Assert
			const expectedPrice = 1;
			expect(result).toBe(expectedPrice);
		});
	});
});
