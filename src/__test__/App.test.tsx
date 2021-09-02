import '@testing-library/jest-dom/extend-expect';
import { App } from '../App';
import { renderWithRouter } from './testhelper';

describe('<App />', () => {
	it('displays <Main />', () => {
		// Act
		renderWithRouter(<App />, '/');

		//Assert
		const mainDiv = document.getElementById('main');
		expect(mainDiv).toBeInTheDocument();
	});

	// it('displays <Marketplace /> when route is /', () => {
	// 	// Act
	// 	renderWithRouter(<App />, '/');

	// 	//Assert
	// 	const marketplaceTable = document.getElementById('marketplace');
	// 	expect(marketplaceTable).toBeInTheDocument();
	// });
});
