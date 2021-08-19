import React, { ReactElement } from 'react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { render } from '@testing-library/react';

// https://testing-library.com/docs/example-react-router
export const renderWithRouter = (ui: ReactElement, route?: string) => {
	const history = route ? createMemoryHistory({ initialEntries: [route] }) : createMemoryHistory({ initialEntries: ['/'] });
	const Wrapper: React.ComponentType<{}> = ({ children }) => {
		return <Router history={history}>{children}</Router>;
	};

	return {
		...render(ui, { wrapper: Wrapper }),
		history,
	};
};
