import { AddressLength, FormData } from '../types';
import {
	truncateAddress,
	classNames,
	getLengthDisplay,
	isValidPoolAddress,
	getPoolRfc2396,
	hexToBytes,
	getPublicKeyFromTransaction,
} from '../utils';
import { bufferToHex } from 'ethereumjs-util';
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

	describe('getPoolRfc2396', () => {
		it('converts to correct format', () => {
			// Arrange
			const formData: FormData = {
				poolAddress: 'stratum+tcp://mining.dev.pool.titan.io',
				username: 'test.worker',
				password: 'test1234',
				portNumber: '4242',
			};

			// Act
			const result = getPoolRfc2396(formData);

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
			const result = isValidPoolAddress(validPoolAddress);

			// Assert
			expect(result).toBeTruthy();
		});

		it('returns false with invalid pool address', () => {
			// Arrange
			const invalidPoolAddress = 'stratum+tcp://mining.dev.pool.titan.io:4242';

			// Act
			const result = isValidPoolAddress(invalidPoolAddress);

			// Assert
			expect(result).toBeFalsy();
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

	describe('getPublicKeyAsync', () => {
		it('works', async () => {
			// Arrange
			const transaction = {
				blockHash: '0xab10af2a998d9c20a7f46c1e1750a57082f83de25dbb73d528605de94530902e',
				blockNumber: 11951971,
				from: '0x9dbe919cEaf4071bC6F55F0aa4c2a44b69685A61',
				gas: 2000000,
				gasPrice: '9132167044',
				hash: '0xaa1a88c927c6ef6b773fe32f9c8d3986cd7b78250a4a55a4ff5956526678d74e',
				input:
					'0x95d38b36000000000000000000000000eed15bb091bf3f615400f6f8160ac423eaf6a413000000000000000000000000000000000000000000000000000000012e7e5ac0',
				nonce: 203,
				r: '0x243627fc327ed3e60b608674208af14297c3a9199da386bc6f5adc8c47d563a4',
				s: '0x44519101be879c84c04cf3ae933e604b1f1f7abc29b8207bc49ca5489694f036',
				to: '0xef69AD53526AE02824FA9FBB8b72B12648c9d622',
				transactionIndex: 3,
				type: 0,
				v: '0x2a',
				value: '0',
			};

			// Act
			const publicKey = getPublicKeyFromTransaction(transaction);

			// Assert
			const expectedResult =
				'047efa4ec202ebaadd91bd0831282d93930ea3de3df4242020e9868746836e42682d2a97cedf4a92c8fe535825aace440d4d77d2e55a6a730153ffbd3587c6b4b5';
			expect(`04${publicKey.toString('hex')}`).toBe(expectedResult);
		});
	});
});
