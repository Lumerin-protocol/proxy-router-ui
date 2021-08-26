import '@testing-library/jest-dom/extend-expect';
import { PageName } from '../App';
import { Main } from '../components/Main';
import { createRouteComponentProps, renderWithRouter } from './testhelper';

describe('<Main />', () => {
	it('displays', () => {
		// Arrange

		// Act
		renderWithRouter(<Main {...createRouteComponentProps()} pageName={PageName.Marketplace} />, '/');

		//Assert
		const LayoutDiv = document.getElementById('main');
		expect(LayoutDiv).toBeInTheDocument();
	});
});
