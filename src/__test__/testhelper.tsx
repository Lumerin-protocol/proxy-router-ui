import React, { ReactElement } from 'react';
import { RouteComponentProps, Router } from 'react-router-dom';
import { match } from 'react-router';
import { createMemoryHistory } from 'history';
import { render } from '@testing-library/react';

// https://testing-library.com/docs/example-react-router
export const renderWithRouter = (ui: ReactElement, route?: string) => {
	const history = route
		? createMemoryHistory({ initialEntries: [route] })
		: createMemoryHistory({ initialEntries: ['/'] });
	const Wrapper: React.ComponentType<{}> = ({ children }) => {
		return <Router history={history}>{children}</Router>;
	};

	return {
		...render(ui, { wrapper: Wrapper }),
		history,
	};
};

export const createRouteComponentProps: () => RouteComponentProps = () => {
	const history = createMemoryHistory();
	const match: match = {
		params: {},
		isExact: false,
		path: '/',
		url: '',
	};
	const props: RouteComponentProps = {
		history: history,
		location: history.location,
		match: match,
	};

	return props;
};
