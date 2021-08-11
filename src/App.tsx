import React, { Suspense } from 'react';
import { Spinner } from './components/ui/Spinner';
import { RouteComponentProps, Switch } from 'react-router-dom';
import { Layout } from './components/Layout';
import { RouteWithErrorBoundary } from './components/RouteWithErrorBoundary';

const routes = (
	<Suspense fallback={<Spinner />}>
		<Switch>
			<RouteWithErrorBoundary path='/' render={(props: RouteComponentProps) => <Layout {...props} />} />
		</Switch>
	</Suspense>
);

export const App: React.FC = () => {
	return routes;
};

App.displayName = 'App';
(App as any).whyDidYouRender = false;
