import '@testing-library/jest-dom/extend-expect';
import { App } from '../App';
import { Marketplace, MarketPlaceData } from '../components/Marketplace';
import { renderWithRouter } from './testhelper';
import { render } from '@testing-library/react';
import { MyOrder } from '../components/Main';
import { MyOrders } from '../components/MyOrders';

// Testing basic behavior and will add more complex tests as needed

// Top level integration tests
describe('<App />', () => {
	it('displays <Main />', () => {
		// Act
		renderWithRouter(<App />, '/');

		// Assert
		const mainDiv = document.getElementById('main');
		expect(mainDiv).toBeInTheDocument();
	});
});

// Page level tests
describe('<Marketplace />', () => {
	it('displays', () => {
		// Arrange
		const contracts: MarketPlaceData[] = [
			{
				id: '',
				price: '1',
				limit: '1',
				speed: 1,
				length: '1',
				trade: '',
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
	it('displays', () => {
		// Arrange
		const myOrders: MyOrder[] = [
			{
				id: '',
				started: '',
				status: '',
				delivered: '',
				progress: '',
			},
		];

		// Act
		render(<MyOrders orders={myOrders} currentBlockTimestamp={0} />);

		// Assert
		const table = document.getElementById('myorders');
		expect(table).toBeInTheDocument();
	});
});
