import '@testing-library/jest-dom/extend-expect';
import { App } from '../App';
import { Marketplace } from '../components/Marketplace';
import { renderWithRouter } from './testhelper';
import { act, render } from '@testing-library/react';
import { MyOrders } from '../components/MyOrders';
import { HashRentalContract } from '../types';

// Testing basic behavior and will add more complex tests as needed

// Top level integration tests
describe('<App />', () => {
	it('displays <Main />', async () => {
		// Act
		await act(async () => {
			renderWithRouter(<App />, '/');
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
				timestamp: '',
				state: '',
			},
		];
		const setContractId = jest.fn();
		const buyClickHandler = jest.fn();

		// Act
		render(<Marketplace contracts={contracts} setContractId={setContractId} buyClickHandler={buyClickHandler} />);

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
				timestamp: '',
				state: '',
			},
		];

		// Act
		await act(async () => {
			render(<MyOrders contracts={contracts} userAccount='' currentBlockTimestamp={1000} />);
		});

		// Assert
		const table = document.getElementById('myorders');
		expect(table).toBeInTheDocument();
	});
});
