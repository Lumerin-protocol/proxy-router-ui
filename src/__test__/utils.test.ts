import { AddressLength, FormData, InputValuesBuyForm } from '../types';
import {
	truncateAddress,
	classNames,
	getLengthDisplay,
	toInputValuesBuyForm,
	isValidPoolAddress,
	toRfc2396,
	hexToBytes,
	encryptFormDataAsync,
} from '../utils';
import { bufferToHex } from 'ethereumjs-util';
import { decrypt } from 'ecies-geth';
const elliptic_1 = require('elliptic');
const ec = new elliptic_1.ec('secp256k1');

// Mocks
const setAlertOpen = jest.fn();

// Use method from browser.js instead of node implementation
const getPublic: (privateKey: Buffer) => Promise<Buffer> = (privateKey) => {
	return new Promise(function (resolve, reject) {
		if (privateKey.length !== 32) {
			reject(new Error('Private key should be 32 bytes long'));
		} else {
			resolve(Buffer.from(ec.keyFromPrivate(privateKey).getPublic('array')));
		}
	});
};
const publicKey =
	'04be310f89a9689ee6994b7d4eab576b7a9dba3bf58b6055a0e04e04f1c7ba96c357012d0c121ca95be8ccfb311f6d869a5aa6988788895d55b4c88f50d64e8bbf';
const privateKey = 'b57e988b38da68791ee478ee284050f9e1554c82f0b8f81d64e4019ebc4ce723';

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

	describe('toRfc2396', () => {
		it('converts to correct format', () => {
			// Arrange
			const formData: FormData = {
				poolAddress: 'stratum+tcp://mining.dev.pool.titan.io',
				username: 'test.worker',
				password: 'test1234',
				portNumber: '4242',
			};

			// Act
			const result = toRfc2396(formData);

			// Assert
			const expectedResult = 'stratum+tcp://test.worker:test1234@mining.dev.pool.titan.io:4242';
			expect(result).toBe(expectedResult);
		});
	});

	describe('isValidPoolAddress', () => {
		it('return true for valid pool address', () => {
			// Arrange
			const validPoolAddress = 'stratum+tcp://mining.dev.pool.titan.io';

			// Act
			const result = isValidPoolAddress(validPoolAddress, setAlertOpen);

			// Assert
			expect(result).toBeTruthy();
		});

		it('returns false with invalid pool address', () => {
			// Arrange
			const invalidPoolAddress = 'stratum+tcp://mining.dev.pool.titan.io:4242';

			// Act
			const result = isValidPoolAddress(invalidPoolAddress, setAlertOpen);

			// Assert
			expect(result).toBeFalsy();
		});
	});

	describe('toInputValuesBuyForm', () => {
		it('returns InputValuesBuyForm', () => {
			// Arrange
			const encryptedPoolData = 'stratum+tcp://lance.worker:password1234@mining.dev.pool.titan.io:4242';

			// Act
			const result = toInputValuesBuyForm(encryptedPoolData);

			// Assert
			const expectedResult: InputValuesBuyForm = {
				poolAddress: 'stratum+tcp://mining.dev.pool.titan.io',
				portNumber: '4242',
				username: 'lance.worker',
				password: 'password1234',
			};
			expect(result).toEqual(expectedResult);
		});
	});

	describe('hexToBytes', () => {
		it('works', async () => {
			// Act
			const privateKeyBuffer = Buffer.from(hexToBytes(privateKey));
			const publicKeyBuffer = await getPublic(privateKeyBuffer);
			const result = bufferToHex(publicKeyBuffer).substring(2);

			// Assert
			expect(result).toBe(publicKey);
		});
	});

	describe('encryptFormDataAsync', () => {
		it('works', async () => {
			// Arrange
			const formData: FormData = {
				poolAddress: 'stratum+tcp://127.0.0.1',
				portNumber: '12',
				username: 'test',
				password: '',
				withValidator: false,
				speed: '100',
				price: '10000000000',
			};
			const message = toRfc2396(formData);

			// Act
			const encryptedFormData = await encryptFormDataAsync(publicKey, formData);
			const result = await decrypt(Buffer.from(hexToBytes(privateKey)), encryptedFormData);

			// Assert
			expect(result).toBe(message);
		});
	});
});
