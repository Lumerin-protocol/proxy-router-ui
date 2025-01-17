import '@testing-library/jest-dom/extend-expect';
import { App } from '../App';
import { Marketplace } from '../components/Marketplace';
import { renderWithRouter } from './testhelper';
import { act, render } from '@testing-library/react';
import { MyOrders } from '../components/MyOrders';
import { ContractState, HashRentalContract, PathName } from '../types';
import { MyContracts } from '../components/MyContracts';
import Web3 from 'web3';

// Testing basic behavior and will add more complex tests as needed

// Mocks
const setContractId = jest.fn();
const buyClickHandler = jest.fn();
const editClickHandler = jest.fn();
const cancelClickHandler = jest.fn();
const claimLmrClickHandler = jest.fn();

const web3 = new Web3(Web3.givenProvider);

// Top level integration tests
describe('<App />', () => {
	it('displays <Main />', async () => {
		// Act
		await act(async () => {
			renderWithRouter(<App />, PathName.Marketplace);
		});

		// Assert
		const mainDiv = document.getElementById('main');
		expect(mainDiv).toBeInTheDocument();
	});
});

// Page level tests
describe('<Marketplace />', () => {
	it('displays', () => {
		// Arrange
		const contracts: HashRentalContract[] = [
			{}, // Represents dummy row for styling purposes
			{
				id: '',
				price: '1',
				speed: '1',
				length: '1',
				trade: '',
				buyer: '',
				seller: '',
				timestamp: '',
				state: ContractState.Available,
			},
		];

		// Act
		render(
			<Marketplace
				web3={web3}
				contracts={contracts}
				setContractId={setContractId}
				buyClickHandler={buyClickHandler}
			/>
		);

		// Assert
		const table = document.getElementById('marketplace');
		expect(table).toBeInTheDocument();
	});
});

describe('<MyOrders />', () => {
	it('displays', async () => {
		// Arrange
		const contracts: HashRentalContract[] = [
			{}, // Represents dummy row for styling purposes
			{
				id: '',
				price: '1',
				speed: '1',
				length: '1',
				trade: '',
				buyer: '',
				seller: '',
				timestamp: '',
				state: ContractState.Running,
			},
		];

		// Act
		render(
			<MyOrders
				web3={web3}
				contracts={contracts}
				userAccount=''
				currentBlockTimestamp={1000}
				setContractId={setContractId}
				editClickHandler={editClickHandler}
				cancelClickHandler={cancelClickHandler}
			/>
		);

		// Assert
		const table = document.getElementById('myorders');
		expect(table).toBeInTheDocument();
	});
});

describe('<MyContracts />', () => {
	it('displays', () => {
		// Arrange
		const contracts: HashRentalContract[] = [
			{}, // Represents dummy row for styling purposes
			{
				id: '',
				price: '1',
				speed: '1',
				length: '1',
				trade: '',
				buyer: '',
				seller: '',
				timestamp: '',
				state: '',
			},
		];

		// Act
		render(
			<MyContracts
				web3={web3}
				contracts={contracts}
				userAccount=''
				currentBlockTimestamp={1000}
				setContractId={setContractId}
				editClickHandler={editClickHandler}
				claimLmrClickHandler={claimLmrClickHandler}
			/>
		);

		// Assert
		const table = document.getElementById('mycontracts');
		expect(table).toBeInTheDocument();
	});
});
