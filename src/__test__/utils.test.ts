import { AddressLength, FormData } from '../types';
import { truncateAddress, classNames, getLengthDisplay, formatToRfc2396 } from '../utils';

describe('utils', () => {
	describe('truncateAddress', () => {
		// Arrange
		const address = '0xEeD15Bb091bf3F615400f6F8160aC423EaF6a413';

		it('short string works', () => {
			// Act
			const result = truncateAddress(address, AddressLength.SHORT);

			// Assert
			const expectedString = '0xEeD...';
			expect(result).toBe(expectedString);
		});

		it('medium string works', () => {
			// Act
			const result = truncateAddress(address, AddressLength.MEDIUM);

			// Assert
			const expectedString = '0xEeD...6a413';
			expect(result).toBe(expectedString);
		});

		it('long string works', () => {
			// Act
			const result = truncateAddress(address, AddressLength.LONG);

			// Assert
			const expectedString = '0xEeD15Bb0...23EaF6a413';
			expect(result).toBe(expectedString);
		});
	});

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

	describe('getLengthDisplay', () => {
		it('displays days', () => {
			// Arrange
			const seconds = 282528;

			// Act
			const result = getLengthDisplay(seconds);

			// Assert
			const expectedResult = '3.27';
			expect(result).toBe(expectedResult);
		});
	});

	describe('formatToRfc2396', () => {
		it('converts to correct format', () => {
			// Arrange
			const formData: FormData = {
				poolAddress: 'stratum+tcp://mining.dev.pool.titan.io',
				username: 'test.worker',
				password: 'test1234',
				portNumber: '4242',
			};

			// Act
			const result = formatToRfc2396(formData);

			// Assert
			const expectedResult = 'stratum+tcp://test.worker:test1234@mining.dev.pool.titan.io:4242';
			expect(result).toBe(expectedResult);
		});
	});
});
