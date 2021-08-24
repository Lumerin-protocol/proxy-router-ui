import '@testing-library/jest-dom/extend-expect';
import { Layout } from '../components/Layout';
import { createRouteComponentProps, renderWithRouter } from './testhelper';

describe('<Layout />', () => {
	it('displays', () => {
		// Arrange

		// Act
		renderWithRouter(<Layout {...createRouteComponentProps()} />, '/');

		//Assert
		const LayoutDiv = document.getElementById('layout');
		expect(LayoutDiv).toBeInTheDocument();
	});
});
