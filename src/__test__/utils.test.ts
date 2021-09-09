import { truncateAddress, classNames } from '../utils';

describe('utils', () => {
	// truncateAddress()
	describe('truncateAddress', () => {
		// Arrange
		const address = '0xEeD15Bb091bf3F615400f6F8160aC423EaF6a413';

		it('shortString works', () => {
			// Act
			const result = truncateAddress(address);

			// Assert
			const expectedString = '0xEeD...6a413';
			expect(result).toBe(expectedString);
		});

		it('longString works', () => {
			// Act
			const result = truncateAddress(address, true);

			// Assert
			const expectedString = '0xEeD15Bb0...23EaF6a413';
			expect(result).toBe(expectedString);
		});
	});

	// classNames()
	describe('classNames', () => {
		// Arrange
		const classes = ['lumerin', 'token', 'is', 'awesome'];
		it('works', () => {
			// Act
			const result = classNames(...classes);

			// Assert
			const expectedResult = classes.join(' ');
			expect(result).toBe(expectedResult);
		});
	});
});