import React, { Suspense } from 'react';
import { Spinner } from './components/ui/Spinner';
import { Route, RouteComponentProps, Switch } from 'react-router-dom';
import { Layout } from './components/Layout';

const routes = (
	<Suspense fallback={<Spinner />}>
		<Switch>
			<Route path='/' render={(props: RouteComponentProps) => <Layout />} />
		</Switch>
	</Suspense>
);

export const App: React.FC = () => {
	return routes;
};

App.displayName = 'App';
(App as any).whyDidYouRender = false;
