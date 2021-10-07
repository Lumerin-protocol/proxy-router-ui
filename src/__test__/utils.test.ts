import { truncateAddress, classNames, AddressLength, getLengthDisplay } from '../utils';

describe('utils', () => {
	// truncateAddress()
	describe('truncateAddress', () => {
		// Arrange
		const address = '0xEeD15Bb091bf3F615400f6F8160aC423EaF6a413';

		it('short string works', () => {
			// Act
			const result = truncateAddress(address, AddressLength.short);

			// Assert
			const expectedString = '0xEeD...';
			expect(result).toBe(expectedString);
		});

		it('medium string works', () => {
			// Act
			const result = truncateAddress(address, AddressLength.medium);

			// Assert
			const expectedString = '0xEeD...6a413';
			expect(result).toBe(expectedString);
		});

		it('long string works', () => {
			// Act
			const result = truncateAddress(address, AddressLength.long);

			// Assert
			const expectedString = '0xEeD15Bb0...23EaF6a413';
			expect(result).toBe(expectedString);
		});
	});

	// classNames()
	describe('classNames', () => {
		it('works', () => {
			// Arrange
			const classes = ['lumerin', 'token', 'is', 'awesome'];

			// Act
			const result = classNames(...classes);

			// Assert
			const expectedResult = classes.join(' ');
			expect(result).toBe(expectedResult);
		});
	});

	// getLengthDispay()
	// TODO: update seconds when contracts updated
	describe('getLengthDisplay', () => {
		it('displays weeks, hours, days', () => {
			// Arrange
			const seconds = 1000;

			// Act
			const result = getLengthDisplay(seconds);

			// Assert
			const expectedResult = '16W / 3D / 17H';
			expect(result).toBe(expectedResult);
		});

		describe('handles 0 values', () => {
			it('for 0 weeks', () => {
				// Arrange
				const seconds = 10;

				// Act
				const result = getLengthDisplay(seconds);

				// Assert
				const expectedResult = '1D / 3H';
				expect(result).toBe(expectedResult);
			});

			it('for 0 days', () => {
				// Arrange
				const seconds = 0.5;

				// Act
				const result = getLengthDisplay(seconds);

				// Assert
				const expectedResult = '1H';
				expect(result).toBe(expectedResult);
			});

			it('for 0 hours', () => {
				// Arrange
				const seconds = 8.64;

				// Act
				const result = getLengthDisplay(seconds);

				// Assert
				const expectedResult = '1D';
				expect(result).toBe(expectedResult);
			});
		});
	});
});
