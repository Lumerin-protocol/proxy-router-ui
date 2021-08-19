import '@testing-library/jest-dom/extend-expect';
import { Layout } from '../components/Layout';
import { renderWithRouter } from './testhelper';

describe('<Layout />', () => {
	it('displays', () => {
		// Act
		renderWithRouter(<Layout />, '/');

		//Assert
		const LayoutDiv = document.getElementById('layout');
		expect(LayoutDiv).toBeInTheDocument();
	});
});
