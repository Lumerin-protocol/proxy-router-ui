import { divideByDigits, multiplyByDigits } from '../web3/helpers';

describe('helpers', () => {
	describe('multiplyByDigits', () => {
		it('works', () => {
			// Arrange
			const price = 1;

			// Act
			const result = multiplyByDigits(price);

			// Assert
			const expectedPrice = 100000000;
			expect(result).toBe(expectedPrice);
		});
	});
	describe('divideByDigits', () => {
		it('works', () => {
			// Arrange
			const price = 100000000;

			// Act
			const result = divideByDigits(price);

			// Assert
			const expectedPrice = 1;
			expect(result).toBe(expectedPrice);
		});
	});
});
